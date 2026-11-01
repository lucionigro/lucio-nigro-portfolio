import assert from 'node:assert/strict';
import * as T from 'three';
import { batchStaticMeshes } from '../src/components/spatial/batch-static-meshes.ts';
const root = new T.Group();
root.position.set(3, 2, -1); root.rotation.y = .3; root.scale.set(1.2, .8, 1.1);
const solid = new T.MeshStandardMaterial(), glass = new T.MeshPhysicalMaterial({transparent: true, opacity: .35});
const add = (parent, x, material = solid) => {
  const mesh = new T.Mesh(new T.BoxGeometry(.5, 1, .7), material);
  mesh.position.set(x, .2, .3); mesh.rotation.z = x * .2; mesh.scale.set(1, .7, 1.1);
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
};
add(root, -1); add(root, 1);
const animated = new T.Group(); root.add(animated); add(animated, -2); add(animated, 2);
const transparent = [add(root, -3, glass), add(root, 3, glass)];
const hidden = add(root, 0); hidden.visible = false;
const otherLayer = add(root, 4); otherLayer.layers.set(2);
const parentMesh = add(root, -4); add(parentMesh, 0);
function snapshot() {
  root.updateWorldMatrix(true, true);
  const vertices = []; let meshes = 0, triangles = 0;
  root.traverse(node => {
    if (!(node instanceof T.Mesh)) return;
    meshes++;
    const geometry = node.geometry, p = geometry.getAttribute('position'), uv = geometry.getAttribute('uv'), normals = geometry.getAttribute('normal');
    triangles += (geometry.index?.count ?? p.count) / 3;
    const normalMatrix = new T.Matrix3().getNormalMatrix(node.matrixWorld);
    for (let i = 0; i < p.count; i++) {
      const point = new T.Vector3().fromBufferAttribute(p, i).applyMatrix4(node.matrixWorld);
      const normal = new T.Vector3().fromBufferAttribute(normals, i).applyNormalMatrix(normalMatrix);
      vertices.push([node.material.uuid, node.castShadow, node.receiveShadow, node.visible, node.layers.mask, ...point.toArray().map(n => Number(n.toFixed(4))), ...normal.toArray().map(n => Number(n.toFixed(4))), uv.getX(i), uv.getY(i)].join(':'));
    }
  });
  return { meshes, triangles, vertices: vertices.sort() };
}
const before = snapshot();
batchStaticMeshes(root, new Set([animated]));
const after = snapshot();
assert(after.meshes < before.meshes, 'Eligible leaves are batched');
assert.equal(after.triangles, before.triangles, 'Triangle count is preserved');
assert.deepEqual(after.vertices, before.vertices, 'World vertices, normals, UVs, materials, visibility, layers and shadow flags are preserved');
assert.equal(animated.children.length, 2, 'Animated subtrees remain separate');
assert(transparent.every(node => node.parent === root), 'Transparent surfaces remain separate');
assert(hidden.parent === root && !hidden.visible, 'Hidden surfaces stay hidden');
assert(parentMesh.parent === root, 'Mesh hierarchies are preserved');
console.log(`Room batching verified: ${before.meshes} → ${after.meshes} meshes, identical ${after.triangles} triangles and surface attributes.`);
