import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    // Backs the drag-to-reorder panes in the Studio sidebar (see
    // sanity/structure.ts) — one shared field, but each pane filters to its
    // own category, so personal and commissioned reorder independently.
    orderRankField({ type: 'project' }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'agency',
      title: 'Agency',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Personal', value: 'personal' },
          { title: 'Commissioned', value: 'commissioned' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      description:
        'Optional. One or two sentences about the project, shown in search results and link previews. Around 150 characters reads best.',
      type: 'text',
      rows: 3,
      validation: (Rule) =>
        Rule.max(300).warning('Search results cut off around 150–160 characters.'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description:
        'Ignored when a Cover Video is set below — one or the other should be filled in.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          description:
            'Optional. What the image shows, for screen readers and image search.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'coverVideo',
      title: 'Cover Video',
      description: 'Takes precedence over Cover Image when both are set.',
      type: 'file',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'images',
      title: 'Images & Videos',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              description:
                'Optional. What the image shows, for screen readers and image search. Left empty, it reads "Title – image 2 of 5".',
              type: 'string',
            }),
          ],
        },
        {
          type: 'file',
          options: { accept: 'video/*' },
          fields: [
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              description:
                'Optional. What the video shows, for screen readers and image search. Left empty, it reads "Title – video 2 of 5".',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Selected Projects',
      description:
        'Include this project in the curated "Selected Projects" index. Unselected projects only appear once "Show All" is clicked.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'role', title: 'Role', type: 'string' }),
            defineField({ name: 'name', title: 'Name', type: 'string' }),
          ],
          preview: {
            select: { title: 'role', subtitle: 'name' },
          },
        },
      ],
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'dateAdded',
      title: 'Date Added',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    orderRankOrdering,
    {
      title: 'Date Added, Newest',
      name: 'dateAddedDesc',
      by: [{ field: 'dateAdded', direction: 'desc' }],
    },
    {
      title: 'Year, Newest',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      if (doc?.coverImage || doc?.coverVideo) return true
      return 'Set a Cover Image or a Cover Video'
    }),
})
