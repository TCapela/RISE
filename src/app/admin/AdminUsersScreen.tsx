import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { Users as UsersIcon, Trash2, Shield, User as UserIcon } from "lucide-react-native";
import {
  fetchUsers,
  deleteUser,
  UserListItem,
} from "../../services/user.service.ts";

type TypeFilter = "all" | "admin" | "user";

export default function AdminUsersScreen() {
  const t = useTheme();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (pageNumber = 1, mode: "initial" | "refresh" | "more" = "initial") => {
    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") setLoadingMore(true);
      setError(null);

      const data = await fetchUsers(pageNumber, 20);

      setPage(data.page);
      setTotalPages(data.totalPages);

      setUsers(prev => {
        if (pageNumber === 1 || mode !== "more") return data.items;
        const prevMap = new Map(prev.map(u => [u.id, u]));
        data.items.forEach(u => prevMap.set(u.id, u));
        return Array.from(prevMap.values());
      });
    } catch {
      setError("Não foi possível carregar os usuários.");
      Alert.alert("Erro", "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadUsers(1, "initial");
  }, []);

  const handleDelete = async (id: number, name: string) => {
    Alert.alert(
      "Remover usuário",
      `Deseja realmente remover ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(id);
              setUsers(prev => prev.filter(u => u.id !== id));
            } catch {
              Alert.alert("Erro", "Não foi possível excluir o usuário.");
            }
          },
        },
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (
        search &&
        !(
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        )
      ) {
        return false;
      }
      if (typeFilter === "all") return true;
      if (typeFilter === "admin") return u.type === "admin";
      return u.type !== "admin";
    });
  }, [users, search, typeFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.type === "admin").length;
  const totalOthers = totalUsers - totalAdmins;

  const renderTypeBadge = (type: string) => {
    const isAdmin = type === "admin";
    const bg = isAdmin ? "rgba(255, 193, 7, 0.12)" : "#1A2035";
    const border = isAdmin ? "#FFC107" : t.colors.border;
    const color = isAdmin ? "#FFC107" : t.colors.textMuted;
    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isAdmin ? (
          <Shield size={12} color={color} />
        ) : (
          <UserIcon size={12} color={color} />
        )}
        <Text
          style={{
            color,
            fontSize: 11,
            fontWeight: "700",
            textTransform: "uppercase",
          }}
        >
          {isAdmin ? "Admin" : "Usuário"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <UsersIcon color={t.colors.primary} />
          <View>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
              Usuários cadastrados
            </Text>

          </View>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            flexDirection: "row",
            gap: t.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>Total</Text>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
              {loading && !users.length ? "…" : totalUsers}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>Admins</Text>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
              {totalAdmins}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>Usuários</Text>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
              {totalOthers}
            </Text>
          </View>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou email"
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

          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {[
              { key: "all" as TypeFilter, label: "Todos" },
              { key: "admin" as TypeFilter, label: "Admins" },
              { key: "user" as TypeFilter, label: "Usuários" },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setTypeFilter(opt.key)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: t.radius.pill,
                  borderWidth: 1,
                  borderColor:
                    typeFilter === opt.key ? t.colors.primary : t.colors.border,
                  backgroundColor:
                    typeFilter === opt.key ? "rgba(78,242,195,0.12)" : "#1A2035",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: typeFilter === opt.key ? t.colors.primary : t.colors.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error && (
          <Text style={{ color: "#FF6B6B", fontSize: 12 }}>
            {error}
          </Text>
        )}

        {loading && !users.length ? (
          <View
            style={{
              marginTop: t.spacing.lg,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" color={t.colors.primary} />
            <Text
              style={{
                marginTop: 8,
                color: t.colors.textMuted,
                fontSize: 12,
              }}
            >
              Carregando usuários...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={i => String(i.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadUsers(1, "refresh")}
                tintColor={t.colors.primary}
              />
            }
            renderItem={({ item }) => {
              const initials = item.name
                .split(" ")
                .map(p => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
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
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(78,242,195,0.10)",
                        borderWidth: 1,
                        borderColor: t.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: t.colors.primary,
                          fontWeight: "800",
                          fontSize: 14,
                        }}
                      >
                        {initials || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: t.colors.text,
                          fontWeight: "700",
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: t.colors.textMuted,
                          fontSize: 12,
                        }}
                        numberOfLines={1}
                      >
                        {item.email}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    {renderTypeBadge(item.type)}
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.name)}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: t.colors.border,
                        backgroundColor: "#1B1020",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Trash2 color="#F44336" size={14} />
                      <Text
                        style={{
                          color: t.colors.textMuted,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        Remover
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: t.colors.textMuted, fontSize: 13, textAlign: "center" }}>
                  Nenhum usuário encontrado com esses filtros.
                </Text>
              </View>
            }
            onEndReached={() => {
              if (!loadingMore && page < totalPages) {
                loadUsers(page + 1, "more");
              }
            }}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={t.colors.primary} />
                  <Text
                    style={{
                      marginTop: 4,
                      color: t.colors.textMuted,
                      fontSize: 11,
                    }}
                  >
                    Carregando mais usuários...
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
