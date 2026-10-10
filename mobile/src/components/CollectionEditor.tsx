import React, { useState } from "react";
import { Sheet, Input, Button, Txt, Row, Chip } from "./ui";
import { useApp } from "../state/AppProvider";
import type { Collection } from "../state/model";
type EditorProps = {
  visible: boolean;
  onClose: () => void;
  collection?: Collection;
  poemId?: string;
};
export function CollectionEditor(props: EditorProps) {
  return props.visible ? <CollectionForm {...props} /> : null;
}
function CollectionForm({
  visible,
  onClose,
  collection,
  poemId,
}: {
  visible: boolean;
  onClose: () => void;
  collection?: Collection;
  poemId?: string;
}) {
  const { setState, t } = useApp(),
    [name, setName] = useState(collection?.name ?? ""),
    [description, setDescription] = useState(collection?.description ?? ""),
    [color, setColor] = useState(collection?.color ?? 0),
    [error, setError] = useState("");
  const save = () => {
    if (!name.trim()) {
      setError(t("Give your collection a name.", "संग्रह को एक नाम दें।"));
      return;
    }
    const next: Collection = {
      id:
        collection?.id ??
        `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      color,
      poemIds: collection?.poemIds ?? (poemId ? [poemId] : []),
    };
    setState((s) => ({
      ...s,
      collections: collection
        ? s.collections.map((c) => (c.id === collection.id ? next : c))
        : [...s.collections, next],
    }));
    onClose();
  };
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={
        collection
          ? t("Edit collection", "संग्रह बदलें")
          : t("A home for your favourites", "पसंदीदा रचनाओं का घर")
      }
    >
      <Txt>{t("Collection name", "संग्रह का नाम")}</Txt>
      <Input
        accessibilityLabel={t("Collection name", "संग्रह का नाम")}
        placeholder={t("e.g. A little hope", "जैसे: थोड़ी सी उम्मीद")}
        value={name}
        onChangeText={setName}
        maxLength={60}
      />
      <Txt>
        {t(
          "A few words about it (optional)",
          "इसके बारे में कुछ शब्द (वैकल्पिक)",
        )}
      </Txt>
      <Input
        accessibilityLabel={t("Description", "विवरण")}
        value={description}
        onChangeText={setDescription}
        placeholder={t(
          "For the poems I return to…",
          "वे कविताएँ जिन्हें बार-बार पढ़ना चाहूँ…",
        )}
        multiline
        maxLength={240}
      />
      <Row style={{ flexWrap: "wrap" }}>
        {["01 · Leaf", "02 · Moon", "03 · Bloom", "04 · Book"].map(
          (label, i) => (
            <Chip
              key={i}
              label={label}
              active={color === i}
              onPress={() => setColor(i)}
            />
          ),
        )}
      </Row>
      {!!error && <Txt accessibilityRole="alert">{error}</Txt>}
      <Button label={t("Save collection", "संग्रह सहेजें")} onPress={save} />
    </Sheet>
  );
}
export function CollectionPicker({
  visible,
  onClose,
  poemId,
}: {
  visible: boolean;
  onClose: () => void;
  poemId: string;
}) {
  const { state, setState, t } = useApp(),
    [create, setCreate] = useState(false);
  return (
    <>
      <Sheet
        visible={visible && !create}
        onClose={onClose}
        title={t("Save to a collection", "संग्रह में जोड़ें")}
      >
        <Txt muted>
          {t(
            "Choose one or more collections. Changes save immediately.",
            "एक या अधिक संग्रह चुनें। बदलाव तुरंत सहेजे जाते हैं।",
          )}
        </Txt>
        {state.collections.map((c) => (
          <Chip
            key={c.id}
            label={`${c.name} · ${c.poemIds.length}`}
            active={c.poemIds.includes(poemId)}
            onPress={() =>
              setState((s) => ({
                ...s,
                collections: s.collections.map((x) =>
                  x.id === c.id
                    ? {
                        ...x,
                        poemIds: x.poemIds.includes(poemId)
                          ? x.poemIds.filter((p) => p !== poemId)
                          : [...x.poemIds, poemId],
                      }
                    : x,
                ),
              }))
            }
          />
        ))}
        <Button
          label={t("+ New collection", "+ नया संग्रह")}
          onPress={() => setCreate(true)}
          subtle
        />
        <Button label={t("Done", "पूर्ण")} onPress={onClose} />
      </Sheet>
      <CollectionEditor
        visible={visible && create}
        poemId={poemId}
        onClose={() => setCreate(false)}
      />
    </>
  );
}
