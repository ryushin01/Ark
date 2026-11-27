// @vitest-environment node
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** Supabase Storage 흉내 */
const upload = vi.fn();
const remove = vi.fn();
const getSupabase = vi.fn();
vi.mock("./supabase.server", () => ({ getSupabase }));

const { checkImageFile, removeStoredImage, uploadImage } = await import("./image-storage.server");

const connected = () => ({
  storage: {
    from: () => ({
      upload,
      remove,
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://project.supabase.test/storage/v1/object/public/images/${path}`,
        },
      }),
    }),
  },
});

/** 실제로 읽을 수 있는 PNG 이미지 파일 */
async function pngFile(width: number, height: number) {
  const buffer = await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 120, b: 40 } },
  })
    .png()
    .toBuffer();
  return new File([new Uint8Array(buffer)], "zeus.png", { type: "image/png" });
}

beforeEach(() => {
  upload.mockReset();
  remove.mockReset();
  getSupabase.mockReturnValue(connected());
});

describe("checkImageFile", () => {
  it("파일이 아니면 골라 달라고 하고, 올릴 수 있는 이미지면 null입니다", async () => {
    expect(checkImageFile("zeus.png")).toMatch(/골라 주세요/);
    expect(checkImageFile(await pngFile(10, 10))).toBeNull();
  });
});

describe("uploadImage", () => {
  it("Supabase를 연결하지 않았으면 올리지 않습니다", async () => {
    getSupabase.mockReturnValue(null);
    const result = await uploadImage(await pngFile(10, 10), "exhibits/zeus.jpg");
    expect(result).toEqual({
      ok: false,
      message: "이미지 업로드는 Supabase를 연결해야 쓸 수 있습니다.",
    });
  });

  it("허용하지 않는 형식이면 이유를 알려 주고 올리지 않습니다", async () => {
    const gif = new File(["GIF89a"], "zeus.gif", { type: "image/gif" });
    const result = await uploadImage(gif, "exhibits/zeus.jpg");
    expect(result).toEqual({ ok: false, message: "JPG, PNG, WebP 이미지만 올릴 수 있습니다." });
    expect(upload).not.toHaveBeenCalled();
  });

  it("이미지로 읽을 수 없는 파일이면 다른 파일을 고르라고 합니다", async () => {
    const broken = new File(["not an image"], "zeus.png", { type: "image/png" });
    const result = await uploadImage(broken, "exhibits/zeus.jpg");
    expect(result).toEqual({
      ok: false,
      message: "이미지를 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.",
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it("긴 변을 1600px로 줄인 JPEG로 올리고 공개 주소와 크기를 돌려줍니다", async () => {
    upload.mockResolvedValue({ error: null });
    const result = await uploadImage(await pngFile(3200, 1600), "exhibits/zeus.jpg");
    expect(result).toEqual({
      ok: true,
      image: {
        src: "https://project.supabase.test/storage/v1/object/public/images/exhibits/zeus.jpg",
        width: 1600,
        height: 800,
      },
    });
    expect(upload).toHaveBeenCalledWith("exhibits/zeus.jpg", expect.any(Buffer), {
      contentType: "image/jpeg",
      upsert: false,
    });
  });

  it("작은 이미지는 키우지 않습니다", async () => {
    upload.mockResolvedValue({ error: null });
    const result = await uploadImage(await pngFile(300, 200), "exhibits/small.jpg");
    expect(result.ok && result.image).toMatchObject({ width: 300, height: 200 });
  });

  it("Storage가 거부하면 그 이유를 알려 줍니다", async () => {
    upload.mockResolvedValue({ error: { message: "The resource already exists" } });
    const result = await uploadImage(await pngFile(10, 10), "exhibits/zeus.jpg");
    expect(result).toEqual({
      ok: false,
      message: "이미지를 올리지 못했습니다: The resource already exists",
    });
  });
});

describe("removeStoredImage", () => {
  it("Storage에 올린 이미지는 경로를 풀어 지웁니다", async () => {
    await removeStoredImage(
      "https://project.supabase.test/storage/v1/object/public/images/exhibits/%EC%A0%9C%EC%9A%B0%EC%8A%A4.jpg",
    );
    expect(remove).toHaveBeenCalledWith(["exhibits/제우스.jpg"]);
  });

  it("시드 이미지나 Supabase가 없을 때는 지우지 않습니다", async () => {
    await removeStoredImage("/images/exhibits/zeus.jpg");
    getSupabase.mockReturnValue(null);
    await removeStoredImage("https://project.supabase.test/storage/v1/object/public/images/a.jpg");
    expect(remove).not.toHaveBeenCalled();
  });
});
