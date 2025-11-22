import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../theme/theme";
import {
  Heart,
  ExternalLink,
  Filter,
  GraduationCap,
  Search,
  X,
  ArrowUpDown,
  BookOpen,
} from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCourses, Course } from "../../services/courses.service";

type CourseCardProps = {
  course: Course;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetails: (course: Course) => void;
};

type SortKey = "title_az" | "title_za" | "saved";

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: active ? "rgba(78,242,195,0.12)" : "#1A2035",
        borderWidth: 1,
        borderColor: active ? t.colors.primary : t.colors.border,
      }}
    >
      <Text
        style={{
          color: active ? t.colors.primary : t.colors.textMuted,
          fontSize: 12,
          fontWeight: active ? "800" : "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TagChip({ tag }: { tag: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#1A2035",
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Text style={{ color: t.colors.primary, fontSize: 11, fontWeight: "700" }}>
        {tag}
      </Text>
    </View>
  );
}

function CourseCard({
  course,
  saved,
  onToggleSave,
  onOpenDetails,
}: CourseCardProps) {
  const t = useTheme();
  const tagPreview = course.tags?.length ? course.tags.slice(0, 3) : [];

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onOpenDetails(course)}
      style={{
        borderRadius: 18,
        padding: 16,
        backgroundColor: t.colors.glass,
        gap: 10,
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: t.colors.text,
              fontSize: 16,
              fontWeight: "800",
              lineHeight: 20,
            }}
          >
            {course.title}
          </Text>

          <Text style={{ color: t.colors.textMuted, marginTop: 4, fontSize: 13 }}>
            {course.format || "Curso"} • {course.area || "Área não informada"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onToggleSave(course.id)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: saved ? "rgba(78,242,195,0.12)" : "transparent",
            borderWidth: 1,
            borderColor: saved ? t.colors.primary : t.colors.border,
          }}
        >
          <Heart color={saved ? t.colors.primary : t.colors.tabInactive} size={18} />
        </TouchableOpacity>
      </View>

      {!!course.description && (
        <Text
          numberOfLines={2}
          style={{ color: t.colors.textMuted, fontSize: 13, marginTop: 2 }}
        >
          {course.description}
        </Text>
      )}

      {tagPreview.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 4,
          }}
        >
          {tagPreview.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          {course.tags && course.tags.length > tagPreview.length && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: t.colors.border,
              }}
            >
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                +{course.tags.length - tagPreview.length}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => onOpenDetails(course)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: t.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: t.colors.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <BookOpen color={t.colors.textMuted} size={14} />
          <Text style={{ color: t.colors.text, fontWeight: "800", fontSize: 13 }}>
            Saber mais
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => course.fiapUrl && Linking.openURL(course.fiapUrl)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: t.colors.primary,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            opacity: course.fiapUrl ? 1 : 0.5,
          }}
          disabled={!course.fiapUrl}
        >
          <ExternalLink color="#0B0D13" size={16} />
          <Text style={{ color: "#0B0D13", fontWeight: "900", fontSize: 13 }}>
            Ver na FIAP
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const [sortBy, setSortBy] = useState<SortKey>("title_az");

  const areas = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.area && set.add(c.area));
    return Array.from(set).sort();
  }, [courses]);

  const formats = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.format && set.add(c.format));
    return Array.from(set).sort();
  }, [courses]);

  useEffect(() => setShowAllSkills(false), [selected?.id]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setAreaFilter("");
    setFormatFilter("");
    setOnlySaved(false);
    setSearch("");
  };

  const filtered = useMemo(() => {
    const list = courses.filter((c) => {
      if (onlySaved && !saved.includes(c.id)) return false;
      if (areaFilter && c.area !== areaFilter) return false;
      if (formatFilter && c.format !== formatFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    const sorted = [...list];

    if (sortBy === "saved") {
      sorted.sort((a, b) => {
        const sa = saved.includes(a.id) ? 1 : 0;
        const sb = saved.includes(b.id) ? 1 : 0;
        if (sb !== sa) return sb - sa;
        return a.title.localeCompare(b.title);
      });
    } else if (sortBy === "title_za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [areaFilter, formatFilter, onlySaved, saved, search, courses, sortBy]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        g: PanResponderGestureState
      ) => Math.abs(g.dy) > 8,
      onPanResponderRelease: (
        _: GestureResponderEvent,
        g: PanResponderGestureState
      ) => {
        if (g.dy > 60) setSelected(null);
      },
    })
  ).current;

  const selectedSkillsBlock = useMemo(() => {
    if (!selected) return { skills: [] as string[], hiddenCount: 0 };
    const skills =
      selected.skills?.length
        ? selected.skills
        : selected.tags?.length
        ? selected.tags
        : selected.tools || [];
    const maxBase = 10;
    if (showAllSkills) return { skills, hiddenCount: 0 };
    if (skills.length <= maxBase) return { skills, hiddenCount: 0 };
    return {
      skills: skills.slice(0, maxBase),
      hiddenCount: skills.length - maxBase,
    };
  }, [selected, showAllSkills]);

  const activeFiltersCount =
    (areaFilter ? 1 : 0) +
    (formatFilter ? 1 : 0) +
    (onlySaved ? 1 : 0) +
    (search ? 1 : 0);

  const sortLabel =
    sortBy === "title_az" ? "A-Z" : sortBy === "title_za" ? "Z-A" : "Salvos";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <GraduationCap color={t.colors.primary} size={22} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "900" }}>
              Explorar cursos
            </Text>
            <Text style={{ color: t.colors.textMuted, marginTop: 2, fontSize: 13 }}>
              {filtered.length} resultados • {saved.length} salvos
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              const next: SortKey =
                sortBy === "title_az"
                  ? "title_za"
                  : sortBy === "title_za"
                  ? "saved"
                  : "title_az";
              setSortBy(next);
            }}
            style={{
              paddingHorizontal: 10,
              height: 36,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: t.colors.glass,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              gap: 6,
            }}
          >
            <ArrowUpDown size={14} color={t.colors.tabInactive} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "800" }}>
              {sortLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFiltersOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: activeFiltersCount
                ? "rgba(78,242,195,0.12)"
                : t.colors.glass,
              borderWidth: 1,
              borderColor: activeFiltersCount ? t.colors.primary : t.colors.border,
            }}
          >
            <Filter
              color={activeFiltersCount ? t.colors.primary : t.colors.tabInactive}
              size={18}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: "#10152A",
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 44,
          }}
        >
          <Search color={t.colors.tabInactive} size={16} />
          <TextInput
            placeholder="Buscar por nome"
            placeholderTextColor={t.colors.tabInactive}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X color={t.colors.tabInactive} size={16} />
            </TouchableOpacity>
          )}
        </View>

        {activeFiltersCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {!!areaFilter && (
                <Pill label={`Área: ${areaFilter}`} active onPress={() => setAreaFilter("")} />
              )}
              {!!formatFilter && (
                <Pill
                  label={`Formato: ${formatFilter}`}
                  active
                  onPress={() => setFormatFilter("")}
                />
              )}
              {onlySaved && (
                <Pill label="Somente salvos" active onPress={() => setOnlySaved(false)} />
              )}
              <Pill label="Limpar filtros" onPress={clearFilters} />
            </View>
          </ScrollView>
        )}

        {loading && (
          <View style={{ paddingTop: 12 }}>
            <ActivityIndicator size="small" color={t.colors.primary} />
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: t.spacing.md,
            paddingTop: 6,
            paddingBottom: insets.bottom + 120,
          }}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              saved={saved.includes(item.id)}
              onToggleSave={toggleSave}
              onOpenDetails={setSelected}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View
                style={{
                  padding: 24,
                  alignItems: "center",
                  backgroundColor: t.colors.glass,
                  borderRadius: t.radius.lg,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  gap: 8,
                }}
              >
                <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                  Nada por aqui
                </Text>
                <Text style={{ color: t.colors.textMuted, textAlign: "center" }}>
                  Tenta remover algum filtro ou buscar por outro termo.
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      marginTop: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: "rgba(78,242,195,0.12)",
                      borderWidth: 1,
                      borderColor: t.colors.primary,
                    }}
                  >
                    <Text style={{ color: t.colors.primary, fontWeight: "900", fontSize: 12 }}>
                      Limpar filtros
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
      </View>

      <Modal
        visible={filtersOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFiltersOpen(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: t.colors.surfaceAlt,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: t.spacing.lg,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  maxHeight: "80%",
                  gap: t.spacing.md,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
                    Filtros
                  </Text>
                  <TouchableOpacity onPress={() => setFiltersOpen(false)}>
                    <X color={t.colors.tabInactive} size={18} />
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Área</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pill label="Todas" active={!areaFilter} onPress={() => setAreaFilter("")} />
                      {areas.map((a) => (
                        <Pill
                          key={a}
                          label={a}
                          active={areaFilter === a}
                          onPress={() => setAreaFilter(areaFilter === a ? "" : a)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Formato</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pill
                        label="Todos"
                        active={!formatFilter}
                        onPress={() => setFormatFilter("")}
                      />
                      {formats.map((f) => (
                        <Pill
                          key={f}
                          label={f}
                          active={formatFilter === f}
                          onPress={() => setFormatFilter(formatFilter === f ? "" : f)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <TouchableOpacity
                  onPress={() => setOnlySaved((v) => !v)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: t.colors.glass,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Heart size={16} color={onlySaved ? t.colors.primary : t.colors.tabInactive} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                      Mostrar somente salvos
                    </Text>
                    <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                      {saved.length} cursos marcados
                    </Text>
                  </View>
                  {onlySaved ? (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "rgba(78,242,195,0.12)",
                        borderWidth: 1,
                        borderColor: t.colors.primary,
                      }}
                    >
                      <Text style={{ color: t.colors.primary, fontWeight: "900", fontSize: 11 }}>
                        Ativo
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 999,
                      backgroundColor: t.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: t.colors.textMuted, fontWeight: "900" }}>
                      Limpar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setFiltersOpen(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 999,
                      backgroundColor: t.colors.primary,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                      Aplicar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelected(null)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                {...panResponder.panHandlers}
                style={{
                  backgroundColor: t.colors.surfaceAlt,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: t.spacing.lg,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  maxHeight: "82%",
                }}
              >
                <View
                  style={{
                    height: 5,
                    width: 60,
                    backgroundColor: t.colors.border,
                    borderRadius: 999,
                    alignSelf: "center",
                    marginBottom: 12,
                  }}
                />

                {selected && (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: t.spacing.md,
                      paddingBottom: insets.bottom + 40,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "900" }}>
                          {selected.title}
                        </Text>
                        <Text style={{ color: t.colors.textMuted, fontSize: 13, marginTop: 4 }}>
                          {selected.format || "Curso"} • {selected.area || "Área não informada"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => toggleSave(selected.id)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: saved.includes(selected.id)
                            ? "rgba(78,242,195,0.12)"
                            : "transparent",
                          borderWidth: 1,
                          borderColor: saved.includes(selected.id)
                            ? t.colors.primary
                            : t.colors.border,
                        }}
                      >
                        <Heart
                          color={saved.includes(selected.id) ? t.colors.primary : t.colors.tabInactive}
                          size={18}
                        />
                      </TouchableOpacity>
                    </View>

                    {!!selected.description && (
                      <View
                        style={{
                          backgroundColor: t.colors.glass,
                          borderRadius: t.radius.md,
                          padding: t.spacing.md,
                          borderWidth: 1,
                          borderColor: t.colors.border,
                        }}
                      >
                        <Text style={{ color: t.colors.text, fontWeight: "900", marginBottom: 4 }}>
                          Sobre o curso
                        </Text>
                        <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                          {selected.description}
                        </Text>
                      </View>
                    )}

                    {(selected.modes?.length || selected.campuses?.length) ? (
                      <View
                        style={{
                          backgroundColor: t.colors.glass,
                          borderRadius: t.radius.md,
                          padding: t.spacing.md,
                          borderWidth: 1,
                          borderColor: t.colors.border,
                          gap: 8,
                        }}
                      >
                        <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                          Formatos & locais
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          {selected.modes?.map((m) => (
                            <Pill key={m} label={m} />
                          ))}
                          {selected.campuses?.map((c) => (
                            <Pill key={c} label={c} />
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {selected.semesterCerts?.length ? (
                      <View
                        style={{
                          backgroundColor: t.colors.glass,
                          borderRadius: t.radius.md,
                          padding: t.spacing.md,
                          borderWidth: 1,
                          borderColor: t.colors.border,
                          gap: 8,
                        }}
                      >
                        <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                          Certificação por semestre
                        </Text>
                        {selected.semesterCerts.map((c, idx) => (
                          <View
                            key={`${c.label}-${idx}`}
                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: t.colors.primary,
                              }}
                            />
                            <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                              {c.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {selectedSkillsBlock.skills.length > 0 && (
                      <View
                        style={{
                          backgroundColor: t.colors.glass,
                          borderRadius: t.radius.md,
                          padding: t.spacing.md,
                          borderWidth: 1,
                          borderColor: t.colors.border,
                          gap: 8,
                        }}
                      >
                        <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                          Competências & ferramentas
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          {selectedSkillsBlock.skills.map((tag) => (
                            <TagChip key={tag} tag={tag} />
                          ))}
                          {selectedSkillsBlock.hiddenCount > 0 && (
                            <TouchableOpacity
                              onPress={() => setShowAllSkills(true)}
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: "#10152A",
                                borderWidth: 1,
                                borderColor: t.colors.border,
                              }}
                            >
                              <Text
                                style={{
                                  color: t.colors.textMuted,
                                  fontSize: 11,
                                  fontWeight: "700",
                                }}
                              >
                                Ver tudo (+{selectedSkillsBlock.hiddenCount})
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {showAllSkills &&
                          selectedSkillsBlock.hiddenCount === 0 &&
                          (selected.skills || selected.tags || selected.tools) && (
                            <TouchableOpacity
                              onPress={() => setShowAllSkills(false)}
                              style={{ marginTop: 4 }}
                            >
                              <Text style={{ color: t.colors.accent, fontSize: 12, fontWeight: "800" }}>
                                Ver menos
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => selected.fiapUrl && Linking.openURL(selected.fiapUrl)}
                      style={{
                        backgroundColor: t.colors.primary,
                        paddingVertical: 12,
                        borderRadius: t.radius.md,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: selected.fiapUrl ? 1 : 0.5,
                      }}
                      disabled={!selected.fiapUrl}
                    >
                      <ExternalLink color="#0B0D13" />
                      <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                        Ver detalhes na FIAP
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
