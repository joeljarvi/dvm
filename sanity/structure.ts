import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

// Projects show as two drag-to-reorder panes instead of the default flat
// list, so the client can set the order personal and commissioned work
// display in on the site (see sanity/queries.ts, which now orders by
// orderRank). Everything else keeps the default listing.
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'project',
        id: 'personalProjects',
        title: 'Personal Projects',
        filter: 'category == "personal"',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'project',
        id: 'commissionedProjects',
        title: 'Commissioned Projects',
        filter: 'category == "commissioned"',
        S,
        context,
      }),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'project',
      ),
    ])
