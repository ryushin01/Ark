"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Button, Callout, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";

import { type ArchiveImage, formatCredit, INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FileInput,
  FormStatus,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { addWorkImageAction, removeWorkImageAction } from "../api/image-actions";

type WorkImagesProps = {
  slug: string;
  title: string;
  images: ArchiveImage[];
  canUpload: boolean;
};

/** 작품 이미지 목록과 추가 폼. 아카이브의 스와이프 갤러리에 나오는 이미지입니다. */
export function WorkImages({ slug, title, images, canUpload }: WorkImagesProps) {
  const [state, action, isPending] = useActionState(
    addWorkImageAction.bind(null, slug),
    INITIAL_FORM_STATE,
  );
  const values = state.status === "success" ? {} : (state.values ?? {});
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });

  return (
    <Flex direction="column" gap="4" asChild>
      <section aria-labelledby="work-images-title">
        <Heading as="h2" size="5" id="work-images-title">
          작품 이미지 <Text color="gray">{images.length}장</Text>
        </Heading>
        <Callout.Root color="orange" highContrast>
          <Callout.Text>
            작품 일러스트는 저작권자가 있습니다. 권리 표기와 출처를 함께 적고, 공개 전에 사용 허락을
            확인해 주세요. 아카이브는 기능 플래그를 켜기 전까지 공개 화면에 나오지 않습니다.
          </Callout.Text>
        </Callout.Root>

        {images.length > 0 && (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3" asChild>
            <ul>
              {images.map((image) => (
                <li key={image.src}>
                  <Card>
                    <Flex direction="column" gap="2">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="240px"
                        style={{ width: "100%", height: "auto" }}
                      />
                      <Text size="1" color="gray">
                        {formatCredit(image.credit)}
                      </Text>
                      <ConfirmDeleteButton
                        name={`${title} 이미지`}
                        onDelete={removeWorkImageAction.bind(null, slug, image.src)}
                      />
                    </Flex>
                  </Card>
                </li>
              ))}
            </ul>
          </Grid>
        )}

        <FormStatus state={state} />
        <form action={action} noValidate>
          <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
            <FileInput
              name="image"
              label="이미지 추가"
              required
              disabled={!canUpload}
              error={state.fieldErrors?.image?.[0]}
              hint={
                canUpload
                  ? "JPG·PNG·WebP, 4MB 이하. 오류가 나면 파일을 다시 골라 주세요."
                  : "이미지 업로드는 Supabase를 연결해야 쓸 수 있습니다."
              }
            />
            <TextAreaInput {...field("alt")} label="대체 텍스트" required rows={2} />
            <Grid columns={{ initial: "1", sm: "3" }} gap="4">
              <TextInput {...field("artist")} label="작가" hint="모르면 비워 둡니다." />
              <TextInput
                {...field("license")}
                label="권리 표기"
                required
                hint="예) © 2004 TYPE-MOON"
              />
              <TextInput {...field("sourceUrl")} label="출처 주소" required type="url" />
            </Grid>
            <Flex>
              <Button type="submit" variant="soft" disabled={isPending || !canUpload}>
                {isPending ? "올리는 중…" : "이미지 추가"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </section>
    </Flex>
  );
}
