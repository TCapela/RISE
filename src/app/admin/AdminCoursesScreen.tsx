import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { GraduationCap, Plus, Edit3, Trash2, Filter } from "lucide-react-native";
import {
  fetchAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
} from "../../services/admin.courses.service";

type AdminCourse = {
  id: string;
  title: string;
  area: string;
  format: string;
  raw: any;
};

const FIXED_USER_ID = 1;

export default function AdminCoursesScreen() {
  const t = useTheme();

  const [list, setList] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [saving, setSaving] = useState(false);

  const [nomeCurso, setNomeCurso] = useState("");
  const [areaCurso, setAreaCurso] = useState("");
  const [descCurso, setDescCurso] = useState("");
  const [linkCurso, setLinkCurso] = useState("");

  const isEditing = !!editingCourse;
  const canSubmit = nomeCurso.trim().length >= 3 && areaCurso.trim().length >= 3;

  const openCreateSheet = () => {
    setEditingCourse(null);
    setNomeCurso("");
    setAreaCurso("");
    setDescCurso("");
    setLinkCurso("");
    setSheetVisible(true);
  };

  const openEditSheet = (item: AdminCourse) => {
    setEditingCourse(item);
    setNomeCurso(item.title || "");
    setAreaCurso(item.area || "");
    setDescCurso(item.raw?.descCurso ?? item.raw?.DescCurso ?? "");
    setLinkCurso(item.raw?.linkCurso ?? item.raw?.LinkCurso ?? "");
    setSheetVisible(true);
  };

  const closeSheet = () => {
    if (saving) return;
    setSheetVisible(false);
    setEditingCourse(null);
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCourses();
      setList(data);
    } catch (e) {
      setList([]);
      Alert.alert("Erro", "Não foi possível carregar os cursos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const areas = useMemo(() => {
    const s = new Set<string>();
    list.forEach((c) => c.area && s.add(c.area));
    return Array.from(s).sort();
  }, [list]);

  const formats = useMemo(() => {
    const s = new Set<string>();
    list.forEach((c) => c.format && s.add(c.format));
    return Array.from(s).sort();
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (areaFilter && c.area !== areaFilter) return false;
      if (formatFilter && c.format !== formatFilter) return false;
      return true;
    });
  }, [list, search, areaFilter, formatFilter]);

  const handleSave = async () => {
    if (!canSubmit || saving) return;

    try {
      setSaving(true);

      if (!isEditing) {
        const payload = {
          nomeCurso: nomeCurso.trim(),
          descCurso: descCurso.trim() || null,
          linkCurso: linkCurso.trim() || null,
          areaCurso: areaCurso.trim(),
          idUsuario: FIXED_USER_ID,
        };

        await createAdminCourse(payload);
      } else if (editingCourse) {
        const payload = {
          nomeCurso: nomeCurso.trim(),
          descCurso: descCurso.trim() || null,
          linkCurso: linkCurso.trim() || null,
          areaCurso: areaCurso.trim(),
          idUsuario: editingCourse.raw?.idUsuario ?? FIXED_USER_ID,
        };

        await updateAdminCourse(Number(editingCourse.id), payload);
      }

      await load();
      closeSheet();
    } catch (e: any) {
      Alert.alert("Erro", "Não foi possível salvar o curso.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Remover curso", "Deseja remover este curso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdminCourse(Number(id));
            await load();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir o curso.");
          }
        },
      },
    ]);
  };

  const totalCursos = list.length;
  const totalAreas = areas.length;
  const totalFormats = formats.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <GraduationCap color={t.colors.primary} />
            <View>
              <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
                Gerenciar cursos
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Integração via API ({totalCursos} cursos).
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setFiltersOpen((v) => !v)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: filtersOpen ? t.colors.primary : t.colors.border,
              backgroundColor: filtersOpen ? "rgba(78,242,195,0.12)" : t.colors.glass,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Filter
              color={filtersOpen ? t.colors.primary : t.colors.textMuted}
              size={16}
            />
            <Text
              style={{
                color: filtersOpen ? t.colors.primary : t.colors.textMuted,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Filtros
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: t.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Total de cursos
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {totalCursos}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Áreas diferentes
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {totalAreas}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Formatos
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {totalFormats}
            </Text>
          </View>
        </View>

        {filtersOpen && (
          <View
            style={{
              backgroundColor: t.colors.glass,
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: t.spacing.sm,
            }}
          >
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              Filtros
            </Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nome do curso"
              placeholderTextColor={t.colors.tabInactive}
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                height: 44,
                marginBottom: 6,
              }}
            />

            <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: t.colors.textMuted,
                    fontSize: 11,
                    marginBottom: 4,
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
                        borderColor: areaFilter
                          ? t.colors.border
                          : t.colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          color: areaFilter
                            ? t.colors.textMuted
                            : t.colors.primary,
                          fontSize: 12,
                        }}
                      >
                        Todas
                      </Text>
                    </TouchableOpacity>
                    {areas.map((a) => (
                      <TouchableOpacity
                        key={a}
                        onPress={() =>
                          setAreaFilter(a === areaFilter ? "" : a)
                        }
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
                            areaFilter === a
                              ? t.colors.primary
                              : t.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              areaFilter === a
                                ? t.colors.primary
                                : t.colors.text,
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

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: t.colors.textMuted,
                    fontSize: 11,
                    marginBottom: 4,
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
            </View>
          </View>
        )}

        {loading && (
          <View style={{ paddingTop: 8 }}>
            <ActivityIndicator size="small" color={t.colors.primary} />
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.text, fontWeight: "700" }}>
                  {item.title}
                </Text>
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  {item.format} • {item.area}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => openEditSheet(item)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    backgroundColor: "#10152A",
                  }}
                >
                  <Edit3 color={t.colors.textMuted} size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(item.id)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    backgroundColor: "#1B1020",
                  }}
                >
                  <Trash2 color="#F44336" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                  Nenhum curso cadastrado ainda.
                </Text>
              </View>
            ) : null
          }
        />

        <TouchableOpacity
          onPress={openCreateSheet}
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: t.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <Plus color="#0B0D13" size={22} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={closeSheet}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: t.colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: t.spacing.lg,
              borderTopWidth: 1,
              borderColor: t.colors.border,
              gap: t.spacing.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: t.colors.border,
                alignSelf: "center",
                marginBottom: 8,
              }}
            />
            <Text
              style={{
                color: t.colors.text,
                fontSize: 16,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              {isEditing ? "Editar curso" : "Novo curso"}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12, marginBottom: 4 }}>
              Campos alinhados ao modelo do banco: nome, área, descrição e link.
            </Text>

            <TextInput
              value={nomeCurso}
              onChangeText={setNomeCurso}
              placeholder="Nome do curso"
              placeholderTextColor={t.colors.tabInactive}
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                height: 44,
              }}
            />

            <TextInput
              value={areaCurso}
              onChangeText={setAreaCurso}
              placeholder="Área do curso"
              placeholderTextColor={t.colors.tabInactive}
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                height: 44,
              }}
            />

            <TextInput
              value={descCurso}
              onChangeText={setDescCurso}
              placeholder="Descrição do curso (opcional)"
              placeholderTextColor={t.colors.tabInactive}
              multiline
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 70,
              }}
            />

            <TextInput
              value={linkCurso}
              onChangeText={setLinkCurso}
              placeholder="Link FIAP ou material (opcional)"
              placeholderTextColor={t.colors.tabInactive}
              keyboardType="url"
              autoCapitalize="none"
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                height: 44,
              }}
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSubmit || saving}
                style={{
                  flex: 1,
                  backgroundColor:
                    !canSubmit || saving ? t.colors.border : t.colors.primary,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#0B0D13" />
                ) : (
                  <Plus color="#0B0D13" />
                )}
                <Text
                  style={{
                    color: "#0B0D13",
                    fontWeight: "800",
                  }}
                >
                  {isEditing ? "Salvar alterações" : "Criar curso"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeSheet}
                disabled={saving}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: "#10152A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: t.colors.textMuted,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
