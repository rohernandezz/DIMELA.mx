/**
 * TipTap bio editor for /editar/ (client-only).
 *
 * Bold/italic marks are off: never synthesize missing faces (docs/brand.md).
 * Toolbar keeps a disabled Itálicas control until a real italic face ships.
 */
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

export type BioEditor = {
  editor: Editor;
  getHTML: () => string;
  destroy: () => void;
};

export function mountBioEditor(options: {
  element: HTMLElement;
  content: string;
  onUpdate?: (html: string) => void;
}): BioEditor {
  const editor = new Editor({
    element: options.element,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bold: false,
        italic: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "underline underline-offset-2" },
      }),
      Placeholder.configure({
        placeholder: "Escribe tu bio…",
      }),
    ],
    content: options.content.startsWith("<")
      ? options.content
      : `<p>${options.content}</p>`,
    editorProps: {
      attributes: {
        class:
          "dm-content min-h-[9rem] px-3 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      options.onUpdate?.(ed.getHTML());
    },
  });

  return {
    editor,
    getHTML: () => editor.getHTML(),
    destroy: () => editor.destroy(),
  };
}

export function bindBioToolbar(toolbar: HTMLElement, editor: Editor) {
  toolbar.querySelectorAll<HTMLButtonElement>("[data-bio-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.bioCmd;
      const chain = editor.chain().focus();
      if (cmd === "h2") chain.toggleHeading({ level: 2 }).run();
      if (cmd === "paragraph") chain.setParagraph().run();
      if (cmd === "bullet") chain.toggleBulletList().run();
      if (cmd === "blockquote") chain.toggleBlockquote().run();
      if (cmd === "clear") chain.clearNodes().unsetAllMarks().run();
      if (cmd === "link") {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("URL del enlace", prev || "https://");
        if (url === null) return;
        if (url === "") chain.extendMarkRange("link").unsetLink().run();
        else chain.extendMarkRange("link").setLink({ href: url }).run();
      }
    });
  });
}
