import { defineField, defineType } from "sanity";

// The Connect column of the About page. A single document (see
// sanity/structure.ts).
export const connect = defineType({
  name: "connect",
  title: "Connect",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      description: "Full profile URL, e.g. https://www.instagram.com/name/",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "other",
      title: "Other",
      description: "Further ways to get in touch, listed after Instagram.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              description: "A web address, or mailto: / tel: for email and phone.",
              type: "url",
              validation: (Rule) =>
                Rule.required().uri({
                  scheme: ["http", "https", "mailto", "tel"],
                }),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Connect" }),
  },
});
