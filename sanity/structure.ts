import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      orderableDocumentListDeskItem({
        type: "project",
        id: "personalProjects",
        title: "Personal Projects",
        filter: 'category == "personal"',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "project",
        id: "commissionedProjects",
        title: "Commissioned Projects",
        filter: 'category == "commissioned"',
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("settings").documentId("siteSettings")),
      S.listItem()
        .title("Connect")
        .id("connect")
        .child(S.document().schemaType("connect").documentId("connect")),
      ...S.documentTypeListItems().filter(
        (item) =>
          !["project", "settings", "connect"].includes(item.getId() ?? ""),
      ),
    ]);
