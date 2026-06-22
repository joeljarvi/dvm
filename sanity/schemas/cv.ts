import { defineField, defineType } from 'sanity'

export const cv = defineType({
  name: 'cv',
  title: 'CV',
  type: 'document',
  fields: [
    defineField({
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'role', title: 'Role', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'company', title: 'Company', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'yearStart', title: 'Year Start', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'yearEnd', title: 'Year End', type: 'number' }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
          ],
          preview: {
            select: { title: 'role', subtitle: 'company' },
          },
        },
      ],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'degree', title: 'Degree', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'school', title: 'School', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
          ],
          preview: {
            select: { title: 'degree', subtitle: 'school' },
          },
        },
      ],
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'issuer', title: 'Issuer', type: 'string' }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'issuer' },
          },
        },
      ],
    }),
    defineField({
      name: 'press',
      title: 'Press',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'publication', title: 'Publication', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'publication' },
          },
        },
      ],
    }),
  ],
})
