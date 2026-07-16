/**
 * Lightweight image crop modal (client-only). Used for avatar uploads on /editar/.
 */

export type ImageCropperOptions = {
  aspectRatio?: number;
  outputSize?: number;
  mask?: "circle" | "rect";
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type CropState = {
  panX: number;
  panY: number;
  zoom: number;
};

const VIEWPORT_PX = 280;

function clampPan(iw: number, ih: number, scale: number, panX: number, panY: number, size: number) {
  const halfW = (iw * scale) / 2;
  const halfH = (ih * scale) / 2;
  const center = size / 2;
  const minX = size - halfW - center;
  const maxX = halfW - center;
  const minY = size - halfH - center;
  const maxY = halfH - center;
  return {
    panX: Math.min(maxX, Math.max(minX, panX)),
    panY: Math.min(maxY, Math.max(minY, panY)),
  };
}

function minCoverScale(iw: number, ih: number, size: number) {
  return Math.max(size / iw, size / ih);
}

function exportCrop(
  img: HTMLImageElement,
  state: CropState,
  viewportSize: number,
  outputSize: number,
): Promise<Blob | null> {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = minCoverScale(iw, ih, viewportSize) * state.zoom;
  const cropSizeInImage = viewportSize / scale;
  const cx = iw / 2 - state.panX / scale;
  const cy = ih / 2 - state.panY / scale;
  let sx = cx - cropSizeInImage / 2;
  let sy = cy - cropSizeInImage / 2;
  sx = Math.max(0, Math.min(iw - cropSizeInImage, sx));
  sy = Math.max(0, Math.min(ih - cropSizeInImage, sy));

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(img, sx, sy, cropSizeInImage, cropSizeInImage, 0, 0, outputSize, outputSize);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}

function baseName(file: File) {
  const raw = file.name.replace(/\.[^.]+$/, "").trim();
  return raw || "avatar";
}

export function openAvatarCropper(file: File): Promise<File | null> {
  return openImageCropper(file, {
    aspectRatio: 1,
    outputSize: 512,
    mask: "circle",
    title: "Recortar avatar",
    confirmLabel: "Usar foto",
    cancelLabel: "Cancelar",
  });
}

export function openImageCropper(file: File, options: ImageCropperOptions = {}): Promise<File | null> {
  const {
    outputSize = 512,
    mask = "circle",
    title = "Recortar imagen",
    confirmLabel = "Usar foto",
    cancelLabel = "Cancelar",
  } = options;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";

    let settled = false;
    const finish = (result: File | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
      overlay.remove();
      document.removeEventListener("keydown", onKeyDown);
      resolve(result);
    };

    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", title);
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;background:color-mix(in oklab,var(--color-dm-offblack,#383636) 55%,transparent);";

    const panel = document.createElement("div");
    panel.style.cssText =
      "width:min(100%,22rem);border-radius:0.375rem;border:1px solid color-mix(in oklab,var(--color-dm-offblack,#383636) 15%,transparent);background:var(--color-dm-offwhite,#e9ebee);padding:1rem;box-shadow:0 20px 40px color-mix(in oklab,var(--color-dm-offblack,#383636) 25%,transparent);";

    const heading = document.createElement("p");
    heading.textContent = title;
    heading.style.cssText =
      "margin:0 0 0.75rem;font-size:1.05rem;letter-spacing:0.02em;color:var(--color-dm-offblack,#383636);";

    const wrap = document.createElement("div");
    wrap.style.cssText = `position:relative;width:${VIEWPORT_PX}px;height:${VIEWPORT_PX}px;margin:0 auto;touch-action:none;cursor:grab;`;

    const clip = document.createElement("div");
    clip.style.cssText =
      "position:absolute;inset:0;border-radius:50%;overflow:hidden;clip-path:circle(50% at 50% 50%);isolation:isolate;";

    const imageEl = document.createElement("img");
    imageEl.alt = "";
    imageEl.draggable = false;
    imageEl.style.cssText =
      "position:absolute;left:50%;top:50%;max-width:none;user-select:none;pointer-events:none;transform-origin:center center;will-change:transform;";

    const dim = document.createElement("div");
    dim.setAttribute("aria-hidden", "true");
    const radius = VIEWPORT_PX / 2;
    dim.style.cssText = [
      "pointer-events:none",
      "position:absolute",
      "inset:0",
      `background:color-mix(in oklab,var(--color-dm-offblack,#383636) 45%,transparent)`,
      `-webkit-mask-image:radial-gradient(circle at center,transparent ${radius - 1}px,black ${radius}px)`,
      `mask-image:radial-gradient(circle at center,transparent ${radius - 1}px,black ${radius}px)`,
    ].join(";");

    const ring = document.createElement("div");
    ring.setAttribute("aria-hidden", "true");
    ring.style.cssText =
      mask === "circle"
        ? "pointer-events:none;position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 0 2px color-mix(in oklab,white 70%,transparent);"
        : "pointer-events:none;position:absolute;inset:0;border:2px solid color-mix(in oklab,white 70%,transparent);";

    const hint = document.createElement("p");
    hint.textContent = "Arrastra para encuadrar · usa el zoom";
    hint.style.cssText =
      "margin:0.65rem 0 0.5rem;text-align:center;font-size:11px;color:color-mix(in oklab,var(--color-dm-offblack,#383636) 55%,transparent);";

    const zoomLabel = document.createElement("label");
    zoomLabel.style.cssText = "display:block;margin:0 0 0.85rem;font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:color-mix(in oklab,var(--color-dm-offblack,#383636) 45%,transparent);";
    zoomLabel.textContent = "Zoom";

    const zoomInput = document.createElement("input");
    zoomInput.type = "range";
    zoomInput.min = "1";
    zoomInput.max = "3";
    zoomInput.step = "0.01";
    zoomInput.value = "1";
    zoomInput.style.cssText = "display:block;width:100%;margin-top:0.35rem;accent-color:var(--color-dm-offblack,#383636);";

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;justify-content:flex-end;gap:0.5rem;";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = cancelLabel;
    cancelBtn.style.cssText =
      "border-radius:0.25rem;border:1px solid color-mix(in oklab,var(--color-dm-offblack,#383636) 20%,transparent);background:white;padding:0.35rem 0.75rem;font-size:12px;color:color-mix(in oklab,var(--color-dm-offblack,#383636) 80%,transparent);";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = confirmLabel;
    confirmBtn.style.cssText =
      "border-radius:0.25rem;border:1px solid color-mix(in oklab,var(--color-dm-offblack,#383636) 20%,transparent);background:var(--color-dm-offblack,#383636);padding:0.35rem 0.75rem;font-size:12px;color:var(--color-dm-offwhite,#e9ebee);";

    let state: CropState = { panX: 0, panY: 0, zoom: 1 };
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panStartX = 0;
    let panStartY = 0;

    const applyTransform = () => {
      if (!img.naturalWidth) return;
      const base = minCoverScale(img.naturalWidth, img.naturalHeight, VIEWPORT_PX);
      const scale = base * state.zoom;
      const clamped = clampPan(
        img.naturalWidth,
        img.naturalHeight,
        scale,
        state.panX,
        state.panY,
        VIEWPORT_PX,
      );
      state.panX = clamped.panX;
      state.panY = clamped.panY;
      imageEl.style.width = `${img.naturalWidth}px`;
      imageEl.style.height = `${img.naturalHeight}px`;
      imageEl.style.transform = `translate(calc(-50% + ${state.panX}px), calc(-50% + ${state.panY}px)) scale(${scale})`;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(null);
    };

    cancelBtn.addEventListener("click", () => finish(null));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) finish(null);
    });

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      const blob = await exportCrop(img, state, VIEWPORT_PX, outputSize);
      if (!blob) {
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        return;
      }
      finish(new File([blob], `${baseName(file)}.jpg`, { type: "image/jpeg" }));
    });

    zoomInput.addEventListener("input", () => {
      state.zoom = Number(zoomInput.value);
      applyTransform();
    });

    wrap.addEventListener("pointerdown", (e) => {
      dragging = true;
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = "grabbing";
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = state.panX;
      panStartY = state.panY;
    });

    wrap.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      state.panX = panStartX + (e.clientX - dragStartX);
      state.panY = panStartY + (e.clientY - dragStartY);
      applyTransform();
    });

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = "grab";
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);

    img.onload = () => {
      imageEl.src = objectUrl;
      state = { panX: 0, panY: 0, zoom: 1 };
      zoomInput.value = "1";
      applyTransform();
      confirmBtn.focus();
    };
    img.onerror = () => finish(null);

    zoomLabel.appendChild(zoomInput);
    clip.appendChild(imageEl);
    wrap.appendChild(clip);
    wrap.appendChild(dim);
    wrap.appendChild(ring);
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    panel.appendChild(heading);
    panel.appendChild(wrap);
    panel.appendChild(hint);
    panel.appendChild(zoomLabel);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);

    img.src = objectUrl;
  });
}
