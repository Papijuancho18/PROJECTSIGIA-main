The tables are generated in Markdown format by the `insertTable` function within the `components/word-like-editor.tsx` file. This is a deliberate design choice to represent tables in a plain-text, human-readable format within the editor's content.

When a table is inserted, the `insertTable` function constructs a string that adheres to Markdown table syntax, like this:

```markdown
| Columna 1 | Columna 2 | Columna 3 |
|---|---|---|
| Dato 1,1 | Dato 1,2 | Dato 1,3 |
| Dato 2,1 | Dato 2,2 | Dato 2,3 |
```

This Markdown string is then stored as part of the report's content. For display purposes (e.g., in the live preview or read-only mode), the `parseMarkdownTable` function in the same file interprets this Markdown string and converts it into a structured data format, which is then rendered as an HTML table.

This approach allows for easy editing and storage of table data in a text-based format while providing a rich visual representation when needed.