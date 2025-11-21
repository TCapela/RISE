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
import { Heart, ExternalLink, Filter, GraduationCap } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCourses, Course } from "../../services/courses.service";

type CourseCardProps = {
  course: Course;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetails: (course: Course) => void;
};

function Pill({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#1A2035",
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function CourseCard({ course, saved, onToggleSave, onOpenDetails }: CourseCardProps) {
  const t = useTheme();
  const hours = course.workloadHours;
  const tagPreview =
    course.tags && course.tags.length > 0 ? course.tags.slice(0, 3) : [];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
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
            }}
          >
            {course.title}
          </Text>
          <Text style={{ color: t.colors.textMuted, marginTop: 4, fontSize: 13 }}>
            {course.format || "Curso"} • {course.area || "Área não informada"}
            {hours ? ` • ${hours}h` : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onToggleSave(course.id)}
          style={{
            width: 36,
            height: 36,
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
            <View
              key={tag}
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
          <Text style={{ color: t.colors.text, fontWeight: "800", fontSize: 13 }}>
            Saber mais
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (course.fiapUrl) {
              Linking.openURL(course.fiapUrl);
            }
          }}
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
          <Text style={{ color: "#0B0D13", fontWeight: "800", fontSize: 13 }}>
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
  const [showFilters, setShowFilters] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const areas = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.area) set.add(c.area);
    });
    return Array.from(set).sort();
  }, [courses]);

  const formats = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.format) set.add(c.format);
    });
    return Array.from(set).sort();
  }, [courses]);

  useEffect(() => {
    setShowAllSkills(false);
  }, [selected?.id]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered: Course[] = useMemo(() => {
    const list = courses.filter((c) => {
      if (onlySaved && !saved.includes(c.id)) return false;
      if (areaFilter && c.area !== areaFilter) return false;
      if (formatFilter && c.format !== formatFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    return [...list].sort((a, b) => Number(a.id) - Number(b.id));
  }, [areaFilter, formatFilter, onlySaved, saved, search, courses]);


  const toggleSave = (id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gesture: PanResponderGestureState) =>
        Math.abs(gesture.dy) > 8,
      onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (gesture.dy > 60) {
          setSelected(null);
        }
      },
    })
  ).current;

  const selectedSkillsBlock = useMemo(() => {
    if (!selected) return { skills: [] as string[], hiddenCount: 0 };
    const skills =
      selected.skills && selected.skills.length
        ? selected.skills
        : selected.tags && selected.tags.length
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <GraduationCap color={t.colors.primary} size={22} />
            <View>
              <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "800" }}>
                Explorar cursos
              </Text>
              <Text style={{ color: t.colors.textMuted, marginTop: 2, fontSize: 13 }}>
                Use os filtros para encontrar o que faz sentido pra você.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: showFilters ? "rgba(78,242,195,0.12)" : t.colors.glass,
              borderWidth: 1,
              borderColor: showFilters ? t.colors.primary : t.colors.border,
            }}
          >
            <Filter
              color={showFilters ? t.colors.primary : t.colors.tabInactive}
              size={18}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Buscar por nome (ex.: Análise, IA, Dados...)"
          placeholderTextColor={t.colors.tabInactive}
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#10152A",
            color: t.colors.text,
            borderRadius: t.radius.md,
            paddingHorizontal: 12,
            height: 44,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        />

        {showFilters && (
          <View style={{ gap: t.spacing.sm }}>
            <View>
              <Text
                style={{
                  color: t.colors.textMuted,
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                Área
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setAreaFilter("")}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: areaFilter
                        ? "#1A2035"
                        : "rgba(78,242,195,0.12)",
                      borderWidth: 1,
                      borderColor: areaFilter ? t.colors.border : t.colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: areaFilter ? t.colors.textMuted : t.colors.primary,
                        fontSize: 12,
                      }}
                    >
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {areas.map((a) => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setAreaFilter(a === areaFilter ? "" : a)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor:
                          areaFilter === a
                            ? "rgba(78,242,195,0.12)"
                            : "#1A2035",
                        borderWidth: 1,
                        borderColor:
                          areaFilter === a ? t.colors.primary : t.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            areaFilter === a ? t.colors.primary : t.colors.text,
                          fontSize: 12,
                        }}
                      >
                        {a}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: t.colors.textMuted,
                    marginBottom: 4,
                    fontSize: 12,
                  }}
                >
                  Formato
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setFormatFilter("")}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: formatFilter
                          ? "#1A2035"
                          : "rgba(78,242,195,0.12)",
                        borderWidth: 1,
                        borderColor: formatFilter
                          ? t.colors.border
                          : t.colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          color: formatFilter
                            ? t.colors.textMuted
                            : t.colors.primary,
                          fontSize: 12,
                        }}
                      >
                        Todos
                      </Text>
                    </TouchableOpacity>
                    {formats.map((f) => (
                      <TouchableOpacity
                        key={f}
                        onPress={() =>
                          setFormatFilter(f === formatFilter ? "" : f)
                        }
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor:
                            formatFilter === f
                              ? "rgba(78,242,195,0.12)"
                              : "#1A2035",
                          borderWidth: 1,
                          borderColor:
                            formatFilter === f
                              ? t.colors.primary
                              : t.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              formatFilter === f
                                ? t.colors.primary
                                : t.colors.text,
                            fontSize: 12,
                          }}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ justifyContent: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => setOnlySaved((v) => !v)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: onlySaved
                      ? "rgba(78,242,195,0.12)"
                      : "#1A2035",
                    borderWidth: 1,
                    borderColor: onlySaved
                      ? t.colors.primary
                      : t.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Heart
                    size={14}
                    color={onlySaved ? t.colors.primary : t.colors.tabInactive}
                  />
                  <Text
                    style={{
                      color: onlySaved ? t.colors.primary : t.colors.textMuted,
                      fontSize: 12,
                    }}
                  >
                    Somente salvos ({saved.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View style={{ paddingTop: 16 }}>
            <ActivityIndicator size="small" color={t.colors.primary} />
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: t.spacing.md,
            paddingTop: 8,
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
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: t.colors.textMuted, textAlign: "center" }}>
                  Nenhum curso encontrado com esses filtros.
                </Text>
              </View>
            ) : null
          }
        />
      </View>

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
                  maxHeight: "80%",
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
                    <Text
                      style={{
                        color: t.colors.text,
                        fontSize: 18,
                        fontWeight: "800",
                      }}
                    >
                      {selected.title}
                    </Text>
                    <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                      {selected.format || "Curso"} •{" "}
                      {selected.area || "Área não informada"}
                      {selected.workloadHours
                        ? ` • ${selected.workloadHours}h`
                        : ""}
                    </Text>

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
                        <Text
                          style={{
                            color: t.colors.text,
                            fontWeight: "800",
                            marginBottom: 4,
                          }}
                        >
                          Sobre o curso
                        </Text>
                        <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                          {selected.description}
                        </Text>
                      </View>
                    )}

                    {(selected.modes && selected.modes.length > 0) ||
                    (selected.campuses && selected.campuses.length > 0) ? (
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
                        <Text
                          style={{
                            color: t.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          Formatos & locais
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {selected.modes?.map((m) => (
                            <Pill key={m} label={m} />
                          ))}
                          {selected.campuses?.map((c) => (
                            <Pill key={c} label={c} />
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {selected.semesterCerts && selected.semesterCerts.length > 0 && (
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
                        <Text
                          style={{
                            color: t.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          Certificação por semestre
                        </Text>
                        {selected.semesterCerts.map((c, idx) => (
                          <View
                            key={`${c.label}-${idx}`}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: t.colors.primary,
                              }}
                            />
                            <Text
                              style={{
                                color: t.colors.textMuted,
                                fontSize: 13,
                              }}
                            >
                              {c.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

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
                        <Text
                          style={{
                            color: t.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          Competências & ferramentas
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {selectedSkillsBlock.skills.map((tag) => (
                            <View
                              key={tag}
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: "#1A2035",
                                borderWidth: 1,
                                borderColor: t.colors.border,
                              }}
                            >
                              <Text
                                style={{
                                  color: t.colors.primary,
                                  fontWeight: "700",
                                  fontSize: 11,
                                }}
                              >
                                {tag}
                              </Text>
                            </View>
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
                                  fontWeight: "600",
                                }}
                              >
                                Ver tudo (+{selectedSkillsBlock.hiddenCount})
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        {showAllSkills &&
                          selectedSkillsBlock.hiddenCount === 0 &&
                          selected &&
                          (selected.skills ||
                            selected.tags ||
                            selected.tools) && (
                            <TouchableOpacity
                              onPress={() => setShowAllSkills(false)}
                              style={{ marginTop: 4 }}
                            >
                              <Text
                                style={{
                                  color: t.colors.accent,
                                  fontSize: 12,
                                  fontWeight: "700",
                                }}
                              >
                                Ver menos
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    )}

                    <View style={{ gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => {
                          if (selected.fiapUrl) {
                            Linking.openURL(selected.fiapUrl);
                          }
                        }}
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
                        <Text
                          style={{
                            color: "#0B0D13",
                            fontWeight: "800",
                          }}
                        >
                          Ver detalhes na FIAP
                        </Text>
                      </TouchableOpacity>
                    </View>
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
