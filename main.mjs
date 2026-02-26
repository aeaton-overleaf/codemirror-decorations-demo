import { RangeSetBuilder } from "@codemirror/state";
import { BlockWrapper, Decoration, EditorView, WidgetType } from "@codemirror/view";
import { createHighlighter } from "shiki";

class BadgeWidget extends WidgetType {
  constructor(label, className) {
    super();
    this.label = label;
    this.className = className;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = this.className;
    span.textContent = this.label;
    return span;
  }
}

function setDemoCode(codeId, html) {
  const node = document.getElementById(codeId);
  if (!node) return;
  node.innerHTML = html;
}

async function renderDemoCodeSnippets(snippets) {
  const highlighter = await createHighlighter({
    themes: ["github-light"],
    langs: ["javascript"],
  });
  for (const [codeId, snippet] of Object.entries(snippets)) {
    setDemoCode(
      codeId,
      highlighter.codeToHtml(snippet.trim(), {
        lang: "javascript",
        theme: "github-light",
      }),
    );
  }
}

const markDoc = `A mark decoration highlights a text range.
This important phrase is emphasized by Decoration.mark.`;

const widgetDoc = `A widget decoration inserts custom DOM at a position.
It appears after the first line.`;

const replaceDoc = `A replace decoration hides part of the document.
This [internal note] is replaced by a widget.`;

const lineDoc = `Line decorations target full lines.
TODO: This line has a line decoration.
Another plain line follows.`;

const blockWrapperDoc = `Block wrappers group line blocks under one DOM element.
Wrapped line: first member.
Wrapped line: second member.
This line is outside the wrapper.`;

const demoSnippets = {
  "mark-code": `
new EditorView({
  doc: \`A mark decoration highlights a text range.
This important phrase is emphasized by Decoration.mark.\`,
  extensions: [
    EditorView.decorations.of((view) => {
      const from = view.state.doc.toString().indexOf("important phrase");
      return from < 0
        ? Decoration.none
        : Decoration.set([
            Decoration.mark({ class: "cm-demo-mark" }).range(from, from + "important phrase".length),
          ]);
    }),
  ],
  parent: document.getElementById("mark-demo"),
});
`,
  "widget-code": `
new EditorView({
  doc: \`A widget decoration inserts custom DOM at a position.
It appears after the first line.\`,
  extensions: [
    EditorView.decorations.of((view) => {
      const doc = view.state.doc.toString();
      const lineBreak = doc.indexOf("\\n");
      const pos = lineBreak === -1 ? doc.length : lineBreak;
      return Decoration.set([
        Decoration.widget({ widget: new BadgeWidget("Widget", "cm-demo-widget"), side: 1 }).range(pos),
      ]);
    }),
  ],
  parent: document.getElementById("widget-demo"),
});
`,
  "replace-code": `
new EditorView({
  doc: \`A replace decoration hides part of the document.
This [internal note] is replaced by a widget.\`,
  extensions: [
    EditorView.decorations.of((view) => {
      const from = view.state.doc.toString().indexOf("[internal note]");
      return from < 0
        ? Decoration.none
        : Decoration.set([
            Decoration.replace({ widget: new BadgeWidget("[replaced text]", "cm-demo-replaced") }).range(
              from,
              from + "[internal note]".length,
            ),
          ]);
    }),
  ],
  parent: document.getElementById("replace-demo"),
});
`,
  "line-code": `
new EditorView({
  doc: \`Line decorations target full lines.
TODO: This line has a line decoration.
Another plain line follows.\`,
  extensions: [
    EditorView.decorations.of((view) => {
      const doc = view.state.doc.toString();
      const markerPos = doc.indexOf("TODO:");
      if (markerPos < 0) return Decoration.none;
      const lineStart = doc.lastIndexOf("\\n", markerPos - 1) + 1;
      const builder = new RangeSetBuilder();
      builder.add(lineStart, lineStart, Decoration.line({ attributes: { class: "cm-demo-line" } }));
      return builder.finish();
    }),
  ],
  parent: document.getElementById("line-demo"),
});
`,
  "block-wrapper-code": `
new EditorView({
  doc: \`Block wrappers group line blocks under one DOM element.
Wrapped line: first member.
Wrapped line: second member.
This line is outside the wrapper.\`,
  extensions: [
    EditorView.blockWrappers.of((view) => {
      const doc = view.state.doc.toString();
      const from = doc.indexOf("Wrapped line: first member.");
      const to = doc.indexOf("This line is outside the wrapper.");
      return from < 0 || to < 0 || from >= to
        ? BlockWrapper.set([])
        : BlockWrapper.set([
            BlockWrapper.create({ tagName: "section", attributes: { class: "cm-demo-block-wrapper" } }).range(
              from,
              to,
            ),
          ]);
    }),
  ],
  parent: document.getElementById("block-wrapper-demo"),
});
`,
};

const markParent = document.getElementById("mark-demo");
if (markParent) {
  new EditorView({
    doc: markDoc,
    extensions: [
      EditorView.decorations.of((view) => {
        const from = view.state.doc.toString().indexOf("important phrase");
        return from < 0
          ? Decoration.none
          : Decoration.set([
            Decoration.mark({ class: "cm-demo-mark" }).range(from, from + "important phrase".length),
          ]);
      }),
    ],
    parent: markParent,
  });
}

const widgetParent = document.getElementById("widget-demo");
if (widgetParent) {
  new EditorView({
    doc: widgetDoc,
    extensions: [
      EditorView.decorations.of((view) => {
        const doc = view.state.doc.toString();
        const lineBreak = doc.indexOf("\n");
        const pos = lineBreak === -1 ? doc.length : lineBreak;
        return Decoration.set([
          Decoration.widget({
            widget: new BadgeWidget("Widget", "cm-demo-widget"),
            side: 1,
          }).range(pos),
        ]);
      }),
    ],
    parent: widgetParent,
  });
}

const replaceParent = document.getElementById("replace-demo");
if (replaceParent) {
  new EditorView({
    doc: replaceDoc,
    extensions: [
      EditorView.decorations.of((view) => {
        const from = view.state.doc.toString().indexOf("[internal note]");
        return from < 0
          ? Decoration.none
          : Decoration.set([
            Decoration.replace({
              widget: new BadgeWidget("[replaced text]", "cm-demo-replaced"),
            }).range(from, from + "[internal note]".length),
          ]);
      }),
    ],
    parent: replaceParent,
  });
}

const lineParent = document.getElementById("line-demo");
if (lineParent) {
  new EditorView({
    doc: lineDoc,
    extensions: [
      EditorView.decorations.of((view) => {
        const doc = view.state.doc.toString();
        const markerPos = doc.indexOf("TODO:");
        if (markerPos < 0) return Decoration.none;
        const lineStart = doc.lastIndexOf("\n", markerPos - 1) + 1;
        const builder = new RangeSetBuilder();
        builder.add(lineStart, lineStart, Decoration.line({ attributes: { class: "cm-demo-line" } }));
        return builder.finish();
      }),
    ],
    parent: lineParent,
  });
}

const blockWrapperParent = document.getElementById("block-wrapper-demo");
if (blockWrapperParent) {
  new EditorView({
    doc: blockWrapperDoc,
    extensions: [
      EditorView.blockWrappers.of((view) => {
        const doc = view.state.doc.toString();
        const from = doc.indexOf("Wrapped line: first member.");
        const to = doc.indexOf("This line is outside the wrapper.");
        return from < 0 || to < 0 || from >= to
          ? BlockWrapper.set([])
          : BlockWrapper.set([
            BlockWrapper.create({
              tagName: "section",
              attributes: { class: "cm-demo-block-wrapper" },
            }).range(from, to),
          ]);
      }),
    ],
    parent: blockWrapperParent,
  });
}

await renderDemoCodeSnippets(demoSnippets);
