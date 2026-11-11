import { getCollection } from 'astro:content';

/** All projects, in the order set by each entry's `order` field. */
export async function getProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
