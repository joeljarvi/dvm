import { defineField, defineType } from 'sanity'

// A singleton — see sanity/structure.ts, which pins this to one fixed
// document (_id "siteSettings") instead of a normal creatable list.
export const settings = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'underConstruction',
      title: 'Under Construction',
      description:
        'Shows a maintenance overlay on top of the home page, above the Personal/Commissioned overlays, until this is turned off again.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
