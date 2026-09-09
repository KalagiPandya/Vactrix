/**
 * ============================================================
 * OrgGraph — Adjacency List Graph Data Structure
 * ============================================================
 *
 * PURPOSE:
 *   Represents the entire company org hierarchy as a graph.
 *   Each node = one role/position.
 *   Each directed edge = "reports to" relationship.
 *
 * STRUCTURE:
 *   adjacencyList: Map<nodeId, [childNodeId, childNodeId, ...]>
 *   nodes:         Map<nodeId, nodeData>
 *
 * TIME COMPLEXITY:
 *   Build graph   : O(N)       — one pass over all nodes
 *   DFS traversal : O(N + E)   — N nodes, E edges
 *   Find node     : O(1)       — Map lookup
 *
 * SPACE COMPLEXITY:
 *   O(N + E) — N nodes + E edges stored in adjacency list
 *
 * EXAMPLE ORG TREE (Engineering dept):
 *
 *   Engineering Director (level 1)
 *        |
 *   Engineering Manager (level 2)
 *       /        \
 *  Senior Dev   Senior Dev 2  (level 3)
 *      |
 *  Junior Dev  (level 4)
 *
 * When "Engineering Manager" is promoted:
 *   DFS starts at Engineering Manager node
 *   → finds Senior Dev below
 *   → Senior Dev fills Manager role → Senior Dev node now vacant
 *   → DFS continues to Junior Dev
 *   → Junior Dev fills Senior Dev role → Junior Dev node now vacant
 *   → No more children — DFS terminates
 *   Chain depth = 3
 * ============================================================
 */
class OrgGraph {
  constructor() {
    // adjacencyList: nodeId (string) → array of child nodeIds
    this.adjacencyList = new Map();
    // nodes: nodeId (string) → full node object
    this.nodes = new Map();
  }

  /**
   * addNode — Register a node in the graph
   * O(1)
   */
  addNode(node) {
    const id = node._id.toString();
    this.nodes.set(id, node);
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  /**
   * addEdge — Add directed edge: parent → child
   * Represents "child reports to parent"
   * O(1)
   */
  addEdge(parentId, childId) {
    const pid = parentId.toString();
    const cid = childId.toString();
    if (!this.adjacencyList.has(pid)) {
      this.adjacencyList.set(pid, []);
    }
    this.adjacencyList.get(pid).push(cid);
  }

  /**
   * getChildren — Get all direct reports of a node
   * O(degree of node)
   */
  getChildren(nodeId) {
    const id = nodeId.toString();
    const childIds = this.adjacencyList.get(id) || [];
    return childIds.map(cid => this.nodes.get(cid)).filter(Boolean);
  }

  /**
   * getNode — Get node by id
   * O(1)
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId.toString());
  }

  /**
   * getRoots — Get all nodes with no parent (top of each dept tree)
   * O(N)
   */
  getRoots() {
    const roots = [];
    for (const [, node] of this.nodes) {
      if (!node.parentId) roots.push(node);
    }
    return roots;
  }

  /**
   * dfsVacancyChain — Core Algorithm
   * ============================================================
   * Recursive DFS starting from a vacated node.
   * At each step:
   *   1. Find best candidate to fill this vacancy (scored via scoring engine)
   *   2. If found → that candidate's current role becomes vacant
   *   3. DFS continues downward from the newly vacated role
   *   4. If no candidate → chain terminates (HIGH RISK)
   *
   * @param {string}   vacantNodeId   — The node that just became vacant
   * @param {Function} scoreFn        — Scoring function(user, node) → score
   * @param {Set}      visited        — Prevents cycles (safety guard)
   * @param {number}   depth          — Current chain depth
   * @param {Array}    chain          — Accumulates chain steps
   *
   * TIME COMPLEXITY:  O(N * S) where N = chain length, S = candidates scored per step
   * SPACE COMPLEXITY: O(N) for recursion stack + chain array
   * ============================================================
   */
  dfsVacancyChain(vacantNodeId, scoreFn, visited = new Set(), depth = 0, chain = []) {
    const id = vacantNodeId.toString();

    // Cycle guard — should never happen in a tree, but safe practice
    if (visited.has(id)) return chain;
    visited.add(id);

    const vacantNode = this.getNode(id);
    if (!vacantNode) return chain;

    // Record this vacancy as a chain step
    const step = {
      depth,
      nodeId:     vacantNode._id,
      nodeTitle:  vacantNode.title,
      department: vacantNode.department,
      level:      vacantNode.level,
      vacancy:    `${vacantNode.title} in ${vacantNode.department} became vacant`,
      candidates: [],
      bestCandidate: null,
      filled: false,
    };

    // Score all available candidates for this vacancy
    const scored = scoreFn(vacantNode);
    step.candidates = scored;

    if (scored.length > 0) {
      step.bestCandidate = scored[0]; // already sorted desc by score
      step.filled = true;

      // The best candidate fills this role.
      // Their OLD node is now vacant — DFS continues from there.
      if (step.bestCandidate.currentNodeId) {
        chain.push(step);
        return this.dfsVacancyChain(
          step.bestCandidate.currentNodeId,
          scoreFn,
          visited,
          depth + 1,
          chain
        );
      }
    }

    chain.push(step);
    return chain;
  }

  /**
   * bfsLevels — BFS to get nodes level by level (for org chart rendering)
   * O(N + E)
   */
  bfsLevels(rootId) {
    const levels = [];
    const queue  = [{ id: rootId.toString(), level: 0 }];
    const seen   = new Set();

    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (seen.has(id)) continue;
      seen.add(id);

      if (!levels[level]) levels[level] = [];
      const node = this.getNode(id);
      if (node) levels[level].push(node);

      const children = this.getChildren(id);
      children.forEach(child => {
        queue.push({ id: child._id.toString(), level: level + 1 });
      });
    }
    return levels;
  }

  /**
   * toJSON — Serialize full graph for API response
   */
  toJSON() {
    const nodesArr = [];
    const edgesArr = [];

    for (const [id, node] of this.nodes) {
      nodesArr.push({
        id,
        title:      node.title,
        department: node.department,
        level:      node.level,
        isVacant:   node.isVacant,
        occupiedBy: node.occupiedBy,
      });
    }

    for (const [parentId, children] of this.adjacencyList) {
      children.forEach(childId => {
        edgesArr.push({ from: parentId, to: childId });
      });
    }

    return {
      nodes: nodesArr,
      edges: edgesArr,
      nodeCount: nodesArr.length,
      edgeCount: edgesArr.length,
    };
  }
}

module.exports = OrgGraph;
