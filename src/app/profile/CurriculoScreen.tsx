import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../../store/profile.store";
import { useAuth } from "../../store/auth.store";
import Svg, { Circle } from "react-native-svg";
import {
  FileText,
  Edit3,
  Save,
  Plus,
  X,
  CheckCircle,
  Award,
  Download,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  FolderGit2,
  BadgeCheck,
  User,
  Sparkles,
  ArrowLeft,
} from "lucide-react-native";
import {
  getCurriculoByUser,
  saveCurriculo,
} from "../../services/curriculo.service";
import { gerarCurriculoPDF } from "../../services/curriculoPdf.service";
import { Exp, Edu, Proj, Cert, Lnk } from "../../types/curriculo.types";

function fmtDateTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} • ${hh}:${mi}`;
}

export const Section = React.memo(
  ({
    title,
    icon,
    children,
    right,
    t,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    right?: React.ReactNode;
    t: any;
  }) => (
    <View
      style={{
        backgroundColor: t.colors.surfaceAlt,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing.lg,
        gap: t.spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  )
);

export const Card = React.memo(
  ({ children, t }: { children: React.ReactNode; t: any }) => (
    <View
      style={{
        backgroundColor: t.colors.glass,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing.md,
        gap: 6,
      }}
    >
      {children}
    </View>
  )
);

export default function CurriculoScreen({ navigation }: any) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;

  const { profile, setField, addSkill, removeSkill } = useProfile();
  const { user } = useAuth() as any;

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [role, setRole] = useState(profile.role || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [location, setLocation] = useState((profile as any).location || "");
  const [summary, setSummary] = useState(profile.bio || "");

  const [skillsInput, setSkillsInput] = useState("");
  const [experiences, setExperiences] = useState<Exp[]>([]);
  const [edu, setEdu] = useState<Edu[]>([]);
  const [projects, setProjects] = useState<Proj[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [links, setLinks] = useState<Lnk[]>([]);

  const [expDraft, setExpDraft] = useState<Exp>({
    role: "",
    company: "",
    start: "",
    end: "",
    desc: "",
  });
  const [eduDraft, setEduDraft] = useState<Edu>({
    course: "",
    school: "",
    start: "",
    end: "",
  });
  const [projDraft, setProjDraft] = useState<Proj>({
    name: "",
    link: "",
    desc: "",
  });
  const [certDraft, setCertDraft] = useState<Cert>({
    name: "",
    org: "",
    year: "",
  });
  const [linkDraft, setLinkDraft] = useState<Lnk>({ label: "", url: "" });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [curriculoId, setCurriculoId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const lastSavedSnapshot = useRef<string>("");

  const userId =
    user && Number(user.id) && !Number.isNaN(Number(user.id))
      ? Number(user.id)
      : null;

  useEffect(() => {
    if (!userId) return;

    const loadCv = async () => {
      try {
        setLoading(true);
        const cv = await getCurriculoByUser(userId);
        if (cv) {
          setCurriculoId(cv.idCurriculo);
          setLastUpdated(cv.lastUpdated ?? null);
          if (cv.summary) setSummary(cv.summary);
          if (Array.isArray(cv.experiences)) setExperiences(cv.experiences as Exp[]);
          if (Array.isArray(cv.edu)) setEdu(cv.edu as Edu[]);
          if (Array.isArray(cv.projects)) setProjects(cv.projects as Proj[]);
          if (Array.isArray(cv.certs)) setCerts(cv.certs as Cert[]);
          if (Array.isArray(cv.links)) setLinks(cv.links as Lnk[]);
          const existingSkills = profile.skills || [];
          (cv.skills || []).forEach((s: string) => {
            if (!existingSkills.includes(s)) addSkill(s);
          });

          lastSavedSnapshot.current = JSON.stringify({
            summary: cv.summary,
            skills: cv.skills,
            experiences: cv.experiences,
            edu: cv.edu,
            projects: cv.projects,
            certs: cv.certs,
            links: cv.links,
            name,
            email,
            role,
            phone,
            location,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadCv();
  }, [userId]);

  const persistProfileBasics = () => {
    setField("name", name);
    setField("email", email);
    setField("role", role);
    setField("phone", phone);
    setField("bio", summary);
  };

  const completeness = useMemo(() => {
    let pts = 0;
    let total = 0;
    const bump = (v: boolean) => {
      total += 1;
      if (v) pts += 1;
    };

    bump(Boolean(name.trim()));
    bump(Boolean(email.trim()));
    bump(Boolean(role.trim()));
    bump(Boolean(phone.trim()));
    bump(summary.trim().length >= 60);
    bump((profile.skills?.length || 0) >= 3);
    bump(experiences.length > 0);
    bump(edu.length > 0);
    bump(projects.length > 0 || certs.length > 0);
    bump(links.length > 0);

    const pct = Math.round((pts / total) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [
    name,
    email,
    role,
    phone,
    summary,
    profile.skills,
    experiences,
    edu,
    projects,
    certs,
    links,
  ]);

  const dirty = useMemo(() => {
    const snap = JSON.stringify({
      summary,
      skills: profile.skills || [],
      experiences,
      edu,
      projects,
      certs,
      links,
      name,
      email,
      role,
      phone,
      location,
    });
    return snap !== lastSavedSnapshot.current;
  }, [
    summary,
    profile.skills,
    experiences,
    edu,
    projects,
    certs,
    links,
    name,
    email,
    role,
    phone,
    location,
  ]);

  const suggestions = useMemo(() => {
    const s: string[] = [];
    const skillsCount = profile.skills?.length || 0;

    if (!name.trim()) s.push("Informe seu nome completo.");
    if (!email.trim()) s.push("Adicione um e-mail de contato.");
    if (!role.trim()) s.push("Defina um cargo ou objetivo profissional.");
    if (!phone.trim()) s.push("Inclua um telefone para contato.");

    if (summary.trim().length < 60) s.push("Escreva um resumo mais completo (3–4 linhas).");
    if (skillsCount < 3) s.push(`Adicione pelo menos ${3 - skillsCount} habilidade(s).`);

    if (experiences.length === 0) s.push("Inclua ao menos uma experiência profissional.");
    if (edu.length === 0) s.push("Inclua ao menos uma formação.");
    if (projects.length === 0 && certs.length === 0) s.push("Adicione um projeto ou certificação.");
    if (links.length === 0) s.push("Inclua um link profissional.");

    return s;
  }, [
    name,
    email,
    role,
    phone,
    summary,
    profile.skills,
    experiences.length,
    edu.length,
    projects.length,
    certs.length,
    links.length,
  ]);

  const size = 118;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const addExperience = () => {
    if (!expDraft.role.trim() || !expDraft.company.trim()) return;
    setExperiences((s) => [...s, expDraft]);
    setExpDraft({ role: "", company: "", start: "", end: "", desc: "" });
  };

  const addEducation = () => {
    if (!eduDraft.course.trim() || !eduDraft.school.trim()) return;
    setEdu((s) => [...s, eduDraft]);
    setEduDraft({ course: "", school: "", start: "", end: "" });
  };

  const addProject = () => {
    if (!projDraft.name.trim()) return;
    setProjects((s) => [...s, projDraft]);
    setProjDraft({ name: "", link: "", desc: "" });
  };

  const addCert = () => {
    if (!certDraft.name.trim()) return;
    setCerts((s) => [...s, certDraft]);
    setCertDraft({ name: "", org: "", year: "" });
  };

  const addLink = () => {
    if (!linkDraft.label.trim() || !linkDraft.url.trim()) return;
    setLinks((s) => [...s, linkDraft]);
    setLinkDraft({ label: "", url: "" });
  };

  const removeAt = <T,>(arr: T[], i: number) => arr.filter((_, idx) => idx !== i);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }
    if (!dirty) {
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      persistProfileBasics();
      const skills = profile.skills || [];
      const id = await saveCurriculo(
        userId,
        { summary, skills, experiences, edu, projects, certs, links },
        curriculoId
      );
      setCurriculoId(id);
      setLastUpdated(new Date().toISOString());

      lastSavedSnapshot.current = JSON.stringify({
        summary,
        skills,
        experiences,
        edu,
        projects,
        certs,
        links,
        name,
        email,
        role,
        phone,
        location,
      });

      setEditing(false);
      Alert.alert("Sucesso", "Currículo salvo.");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o currículo.");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    persistProfileBasics();
    await gerarCurriculoPDF({
      name,
      email,
      role,
      phone,
      location,
      summary,
      skills: profile.skills || [],
      experiences,
      education: edu,
      projects,
      certs,
      links,
      completeness,
    });
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: t.spacing.lg,
          paddingBottom: 12,
          backgroundColor: t.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: t.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft color={t.colors.text} size={20} />
          </TouchableOpacity>

          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "900" }}>
              Currículo
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {editing ? "Modo edição" : "Visualização"}
            </Text>
          </View>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: insets.bottom + 140,
          maxWidth: 940,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.xl,
            borderWidth: 1,
            borderColor: t.colors.border,
            padding: t.spacing.lg,
            flexDirection: isNarrow ? "column" : "row",
            gap: t.spacing.lg,
            alignItems: isNarrow ? "stretch" : "center",
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center", alignSelf: isNarrow ? "center" : "flex-start" }}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={t.colors.border}
                strokeWidth={stroke}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={t.colors.primary}
                strokeWidth={stroke}
                strokeDasharray={`${c * (completeness / 100)}, ${c}`}
                strokeLinecap="round"
                rotation="-90"
                originX={size / 2}
                originY={size / 2}
                fill="none"
              />
            </Svg>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "900",
                position: "absolute",
              }}
            >
              {completeness}%
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11, marginTop: 6 }}>
              Completude
            </Text>
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(78,242,195,0.12)",
                  borderWidth: 1,
                  borderColor: t.colors.border,
                }}
              >
                {initials ? (
                  <Text style={{ color: t.colors.primary, fontSize: 18, fontWeight: "900" }}>
                    {initials}
                  </Text>
                ) : (
                  <FileText color={t.colors.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "900" }}>
                  Currículo Inteligente
                </Text>
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  {lastUpdated ? `Atualizado em ${fmtDateTime(lastUpdated)}` : "Ainda não salvo no banco"}
                </Text>
              </View>
            </View>

            {loading && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                <ActivityIndicator size="small" color={t.colors.primary} />
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  Carregando currículo...
                </Text>
              </View>
            )}

            {!loading && completeness < 100 && suggestions.length > 0 && (
              <View style={{ marginTop: 4, gap: 4 }}>
                {suggestions.slice(0, 2).map((sug, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                    <CheckCircle color={t.colors.primary} size={14} style={{ marginTop: 2 }} />
                    <Text style={{ color: t.colors.textMuted, flex: 1 }}>
                      {sug}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => (editing ? handleSave() : setEditing(true))}
            disabled={saving}
            style={{
              backgroundColor: editing ? t.colors.primary : t.colors.surfaceAlt,
              borderWidth: editing ? 0 : 1,
              borderColor: t.colors.border,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: t.radius.pill,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              opacity: saving ? 0.7 : 1,
              alignSelf: isNarrow ? "flex-end" : "auto",
            }}
          >
            {editing ? (
              <Save color="#0B0D13" size={16} />
            ) : (
              <Edit3 color={t.colors.text} size={16} />
            )}
            <Text style={{ color: editing ? "#0B0D13" : t.colors.text, fontWeight: "900" }}>
              {editing ? (saving ? "Salvando..." : dirty ? "Salvar" : "Concluir") : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        <Section t={t} title="Informações pessoais" icon={<User color={t.colors.primary} />}>
          <View style={{ gap: t.spacing.sm }}>
            <TextInput
              editable={editing}
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
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
              editable={editing}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
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
              editable={editing}
              value={role}
              onChangeText={setRole}
              placeholder="Cargo / Objetivo"
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

            <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
              <TextInput
                editable={editing}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefone"
                placeholderTextColor={t.colors.tabInactive}
                style={{
                  flex: 1,
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
                editable={editing}
                value={location}
                onChangeText={setLocation}
                placeholder="Localização"
                placeholderTextColor={t.colors.tabInactive}
                style={{
                  flex: 1,
                  backgroundColor: "#10152A",
                  color: t.colors.text,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  paddingHorizontal: 12,
                  height: 44,
                }}
              />
            </View>

            <TextInput
              editable={editing}
              value={summary}
              onChangeText={setSummary}
              placeholder="Resumo profissional"
              placeholderTextColor={t.colors.tabInactive}
              multiline
              style={{
                backgroundColor: "#10152A",
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                minHeight: 90,
              }}
            />
          </View>
        </Section>

        <Section t={t} title="Habilidades" icon={<Sparkles color={t.colors.accent} />}>
          {editing && (
            <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
              <TextInput
                value={skillsInput}
                onChangeText={setSkillsInput}
                placeholder="Adicionar habilidade"
                placeholderTextColor={t.colors.tabInactive}
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: "#10152A",
                  color: t.colors.text,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  paddingHorizontal: 12,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  const v = skillsInput.trim();
                  if (v) {
                    addSkill(v);
                    setSkillsInput("");
                  }
                }}
                style={{
                  height: 44,
                  paddingHorizontal: 14,
                  borderRadius: t.radius.md,
                  backgroundColor: t.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Plus color="#0B0D13" />
                <Text style={{ color: "#0B0D13", fontWeight: "900" }}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={profile.skills}
            keyExtractor={(i) => i}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: t.spacing.sm, paddingVertical: 2 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1A2035",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: t.radius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                }}
              >
                <Text style={{ color: t.colors.primary, fontWeight: "800" }}>
                  {item}
                </Text>
                {editing && (
                  <TouchableOpacity onPress={() => removeSkill(item)} style={{ marginLeft: 8 }}>
                    <X color={t.colors.tabInactive} size={16} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Adicione suas habilidades principais
              </Text>
            }
          />
        </Section>

        <Section t={t} title="Experiência" icon={<Briefcase color={t.colors.primary} />}>
          {editing && (
            <Card t={t}>
              <TextInput
                value={expDraft.role}
                onChangeText={(v) => setExpDraft({ ...expDraft, role: v })}
                placeholder="Cargo"
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
                value={expDraft.company}
                onChangeText={(v) => setExpDraft({ ...expDraft, company: v })}
                placeholder="Empresa"
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
              <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
                <TextInput
                  value={expDraft.start}
                  onChangeText={(v) => setExpDraft({ ...expDraft, start: v })}
                  placeholder="Início (ex.: 01/2024)"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
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
                  value={expDraft.end}
                  onChangeText={(v) => setExpDraft({ ...expDraft, end: v })}
                  placeholder="Fim (ou Atual)"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
                    backgroundColor: "#10152A",
                    color: t.colors.text,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                  }}
                />
              </View>
              <TextInput
                value={expDraft.desc}
                onChangeText={(v) => setExpDraft({ ...expDraft, desc: v })}
                placeholder="Descrição (impacto, resultados, techs)"
                placeholderTextColor={t.colors.tabInactive}
                multiline
                style={{
                  backgroundColor: "#10152A",
                  color: t.colors.text,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  padding: t.spacing.md,
                  minHeight: 70,
                }}
              />
              <TouchableOpacity
                onPress={addExperience}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: t.colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                }}
              >
                <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                  Adicionar experiência
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {experiences.map((e, i) => (
              <Card t={t} key={`${e.role}-${i}`}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                      {e.role}
                    </Text>
                    <Text style={{ color: t.colors.textMuted }}>
                      {e.company} • {[e.start, e.end].filter(Boolean).join(" — ")}
                    </Text>
                  </View>
                  {editing && (
                    <TouchableOpacity onPress={() => setExperiences(removeAt(experiences, i))}>
                      <X color={t.colors.tabInactive} />
                    </TouchableOpacity>
                  )}
                </View>
                {!!e.desc && <Text style={{ color: t.colors.text, marginTop: 6 }}>{e.desc}</Text>}
              </Card>
            ))}
            {!experiences.length && (
              <Text style={{ color: t.colors.textMuted }}>
                Sem experiências ainda
              </Text>
            )}
          </View>
        </Section>

        <Section t={t} title="Formação" icon={<GraduationCap color={t.colors.accent} />}>
          {editing && (
            <Card t={t}>
              <TextInput
                value={eduDraft.course}
                onChangeText={(v) => setEduDraft({ ...eduDraft, course: v })}
                placeholder="Curso"
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
                value={eduDraft.school}
                onChangeText={(v) => setEduDraft({ ...eduDraft, school: v })}
                placeholder="Instituição"
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
              <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
                <TextInput
                  value={eduDraft.start}
                  onChangeText={(v) => setEduDraft({ ...eduDraft, start: v })}
                  placeholder="Início"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
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
                  value={eduDraft.end}
                  onChangeText={(v) => setEduDraft({ ...eduDraft, end: v })}
                  placeholder="Conclusão"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
                    backgroundColor: "#10152A",
                    color: t.colors.text,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={addEducation}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: t.colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                }}
              >
                <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                  Adicionar formação
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {edu.map((e, i) => (
              <Card t={t} key={`${e.course}-${i}`}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                      {e.course}
                    </Text>
                    <Text style={{ color: t.colors.textMuted }}>
                      {e.school} • {[e.start, e.end].filter(Boolean).join(" — ")}
                    </Text>
                  </View>
                  {editing && (
                    <TouchableOpacity onPress={() => setEdu(removeAt(edu, i))}>
                      <X color={t.colors.tabInactive} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
            {!edu.length && (
              <Text style={{ color: t.colors.textMuted }}>
                Sem formação cadastrada
              </Text>
            )}
          </View>
        </Section>

        <Section t={t} title="Projetos" icon={<FolderGit2 color={t.colors.primary} />}>
          {editing && (
            <Card t={t}>
              <TextInput
                value={projDraft.name}
                onChangeText={(v) => setProjDraft({ ...projDraft, name: v })}
                placeholder="Nome do projeto"
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
                value={projDraft.link}
                onChangeText={(v) => setProjDraft({ ...projDraft, link: v })}
                placeholder="Link (GitHub, site)"
                placeholderTextColor={t.colors.tabInactive}
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
              <TextInput
                value={projDraft.desc}
                onChangeText={(v) => setProjDraft({ ...projDraft, desc: v })}
                placeholder="Descrição (o que fez, impacto, stack)"
                placeholderTextColor={t.colors.tabInactive}
                multiline
                style={{
                  backgroundColor: "#10152A",
                  color: t.colors.text,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  padding: t.spacing.md,
                  minHeight: 70,
                }}
              />
              <TouchableOpacity
                onPress={addProject}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: t.colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                }}
              >
                <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                  Adicionar projeto
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {projects.map((p, i) => (
              <Card t={t} key={`${p.name}-${i}`}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
                  <Text style={{ color: t.colors.text, fontWeight: "900", flex: 1 }}>
                    {p.name}
                  </Text>
                  {editing && (
                    <TouchableOpacity onPress={() => setProjects(removeAt(projects, i))}>
                      <X color={t.colors.tabInactive} />
                    </TouchableOpacity>
                  )}
                </View>
                {!!p.link && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(p.link!)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}
                  >
                    <LinkIcon color={t.colors.primary} size={16} />
                    <Text style={{ color: t.colors.primary }} numberOfLines={1}>
                      {p.link}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!p.desc && <Text style={{ color: t.colors.text, marginTop: 6 }}>{p.desc}</Text>}
              </Card>
            ))}
            {!projects.length && (
              <Text style={{ color: t.colors.textMuted }}>
                Sem projetos ainda
              </Text>
            )}
          </View>
        </Section>

        <Section t={t} title="Certificações" icon={<BadgeCheck color={t.colors.accent} />}>
          {editing && (
            <Card t={t}>
              <TextInput
                value={certDraft.name}
                onChangeText={(v) => setCertDraft({ ...certDraft, name: v })}
                placeholder="Certificação"
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
              <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
                <TextInput
                  value={certDraft.org}
                  onChangeText={(v) => setCertDraft({ ...certDraft, org: v })}
                  placeholder="Instituição"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
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
                  value={certDraft.year}
                  onChangeText={(v) => setCertDraft({ ...certDraft, year: v })}
                  placeholder="Ano"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
                    backgroundColor: "#10152A",
                    color: t.colors.text,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={addCert}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: t.colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                }}
              >
                <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                  Adicionar certificação
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {certs.map((cItem, i) => (
              <Card t={t} key={`${cItem.name}-${i}`}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                      {cItem.name}
                    </Text>
                    <Text style={{ color: t.colors.textMuted }}>
                      {[cItem.org, cItem.year].filter(Boolean).join(" • ")}
                    </Text>
                  </View>
                  {editing && (
                    <TouchableOpacity onPress={() => setCerts(removeAt(certs, i))}>
                      <X color={t.colors.tabInactive} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
            {!certs.length && (
              <Text style={{ color: t.colors.textMuted }}>
                Sem certificações ainda
              </Text>
            )}
          </View>
        </Section>

        <Section t={t} title="Links" icon={<LinkIcon color={t.colors.primary} />}>
          {editing && (
            <Card t={t}>
              <View style={{ flexDirection: isNarrow ? "column" : "row", gap: t.spacing.sm }}>
                <TextInput
                  value={linkDraft.label}
                  onChangeText={(v) => setLinkDraft({ ...linkDraft, label: v })}
                  placeholder="Rótulo (ex.: GitHub)"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    flex: 1,
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
                  value={linkDraft.url}
                  onChangeText={(v) => setLinkDraft({ ...linkDraft, url: v })}
                  placeholder="URL"
                  placeholderTextColor={t.colors.tabInactive}
                  autoCapitalize="none"
                  style={{
                    flex: 2,
                    backgroundColor: "#10152A",
                    color: t.colors.text,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                  }}
                />
                <TouchableOpacity
                  onPress={addLink}
                  style={{
                    height: 44,
                    paddingHorizontal: 14,
                    borderRadius: t.radius.md,
                    backgroundColor: t.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus color="#0B0D13" />
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm }}>
            {links.map((l, i) => (
              <Card t={t} key={`${l.label}-${i}`}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(l.url)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}
                  >
                    <LinkIcon color={t.colors.primary} size={16} />
                    <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                      {l.label}
                    </Text>
                    <Text numberOfLines={1} style={{ color: t.colors.textMuted, flex: 1 }}>
                      {l.url}
                    </Text>
                  </TouchableOpacity>
                  {editing && (
                    <TouchableOpacity onPress={() => setLinks(removeAt(links, i))}>
                      <X color={t.colors.tabInactive} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}

            {!links.length && (
              <Text style={{ color: t.colors.textMuted }}>
                Sem links ainda
              </Text>
            )}
          </View>
        </Section>

        <View style={{ flexDirection: isNarrow ? "column" : "row", gap: 10 }}>
          <TouchableOpacity
            onPress={handleGeneratePdf}
            style={{
              flex: 1,
              backgroundColor: t.colors.primary,
              paddingVertical: 12,
              borderRadius: t.radius.pill,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Download color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
              Baixar PDF
            </Text>
          </TouchableOpacity>

          {editing && (
            <TouchableOpacity
              onPress={() => setEditing(false)}
              style={{
                paddingHorizontal: 16,
                backgroundColor: t.colors.surfaceAlt,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                height: 48,
              }}
            >
              <Text style={{ color: t.colors.textMuted, fontWeight: "900" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ alignItems: "center", marginTop: t.spacing.lg }}>
          <Award color={t.colors.primary} size={22} />
          <Text
            style={{
              color: t.colors.textMuted,
              fontSize: 12,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            R.I.S.E. • Requalificação, Inclusão, Sustentabilidade e Empregabilidade
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
