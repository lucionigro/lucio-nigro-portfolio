import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Batch only stationary, opaque leaves; preserve UVs, normals and shadow flags. */
export function batchStaticMeshes(root: T.Group, animated: ReadonlySet<T.Object3D>) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const buckets = new Map<string, T.Mesh<T.BufferGeometry, T.Material>[]>();
  root.traverse(node => {
    if (!(node instanceof T.Mesh) || node instanceof T.InstancedMesh || node instanceof T.SkinnedMesh || node.children.length || Array.isArray(node.material)) return;
    if (node.material.transparent || node.material.opacity < 1 || node.material instanceof T.ShaderMaterial) return;
    const geometry = node.geometry as T.BufferGeometry;
    if (Object.keys(geometry.morphAttributes).length || geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity || node.matrixWorld.determinant() < 0) return;
    for (let parent: T.Object3D | null = node; parent; parent = parent.parent) if (animated.has(parent) || !parent.visible) return;
    const attributes = Object.entries(geometry.attributes).map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`).sort().join(",");
    const key = `${node.material.uuid}:${!!geometry.index}:${node.castShadow}:${node.receiveShadow}:${node.renderOrder}:${node.layers.mask}:${attributes}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(node);
    buckets.set(key, bucket);
  });
  for (const nodes of buckets.values()) {
    if (nodes.length < 2) continue;
    const parts = nodes.map(node => node.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, node.matrixWorld)));
    const geometry = mergeGeometries(parts, false);
    parts.forEach(part => part.dispose());
    if (!geometry) continue;
    const first = nodes[0];
    const mesh = new T.Mesh(geometry, first.material);
    mesh.name = "Static room batch";
    mesh.castShadow = first.castShadow; mesh.receiveShadow = first.receiveShadow;
    mesh.renderOrder = first.renderOrder; mesh.layers.mask = first.layers.mask;
    nodes.forEach(node => node.removeFromParent());
    root.add(mesh);
  }
}
