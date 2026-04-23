import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { uploadProductImage, deleteProductImages } from "@/lib/productImages";

// ─── Types ───────────────────────────────────────────────────────────────────

type Grupo = { id: number; nombre: string };
type Subgrupo = { id: number; grupo_id: number; nombre: string };
type TipoPieza = { id: number; subgrupo_id: number; nombre: string; orden: number };
type Version = {
  id: number;
  nombre: string;
  modelo_id: number;
  anio_desde: number;
  anio_hasta: number;
  motor_codigo: string;
};

type Props = {
  vendedorId: number;
  supabaseUrl: string;
  supabaseKey: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STEPS = ["Categoría", "Compatibilidad", "Datos del producto"];

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", marginBottom: "2rem" }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        return (
          <div key={n} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                margin: "0 auto",
                borderRadius: "50%",
                background: active ? "#2563eb" : "#e5e7eb",
                color: active ? "#fff" : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {n}
            </div>
            <div style={{ fontSize: 12 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VehicleSelectorHierarchical ─────────────────────────────────────────────

type Marca = { id: number; nombre: string };
type Modelo = { id: number; nombre: string; marca_id: number };
type VersionRow = { id: number; modelo_id: number; anio: number; version: string; motor_codigo: string };

// Una "generación" agrupa todas las filas de versiones con igual (version, motor_codigo)
// y muestra el rango de años en lugar de una fila por año.
type GeneracionRow = {
  key: string;
  version: string;
  motor_codigo: string;
  anio_desde: number;
  anio_hasta: number;
  versiones: VersionRow[]; // todas las filas individuales de esa generación
};

function agruparEnGeneraciones(versiones: VersionRow[]): GeneracionRow[] {
  const map: Record<string, GeneracionRow> = {};
  for (const v of versiones) {
    const key = `${v.version}__${v.motor_codigo}`;
    if (!map[key]) {
      map[key] = { key, version: v.version, motor_codigo: v.motor_codigo, anio_desde: v.anio, anio_hasta: v.anio, versiones: [] };
    }
    map[key].versiones.push(v);
    map[key].anio_desde = Math.min(map[key].anio_desde, v.anio);
    map[key].anio_hasta = Math.max(map[key].anio_hasta, v.anio);
  }
  return Object.values(map).sort((a, b) => a.version.localeCompare(b.version) || a.anio_desde - b.anio_desde);
}

// Agrupa las versiones seleccionadas en generaciones para mostrar en el resumen
function selectedEnGeneraciones(versiones: VersionRow[]): GeneracionRow[] {
  return agruparEnGeneraciones(versiones);
}

function VehicleSelectorHierarchical({
  supabase,
  selectedVersiones,
  setSelectedVersiones,
  onBack,
  onNext,
}: {
  supabase: any;
  selectedVersiones: VersionRow[];
  setSelectedVersiones: (v: VersionRow[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [step, setStep] = useState(0); // 0: marca, 1: modelo, 2: generación
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [generaciones, setGeneraciones] = useState<GeneracionRow[]>([]);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [modeloId, setModeloId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar marcas al montar
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("marcas").select("*").order("nombre");
      setMarcas(data || []);
      setLoading(false);
    })();
  }, []);

  // Cargar modelos al elegir marca
  useEffect(() => {
    if (marcaId) {
      setLoading(true);
      supabase
        .from("modelos")
        .select("*")
        .eq("marca_id", marcaId)
        .order("nombre")
        .then(({ data }: { data: Modelo[] | null }) => {
          setModelos(data || []);
          setLoading(false);
        });
    }
  }, [marcaId]);

  // Cargar versiones y agrupar en generaciones al elegir modelo
  useEffect(() => {
    if (modeloId) {
      setLoading(true);
      supabase
        .from("versiones")
        .select("id, modelo_id, anio, version, motor_codigo")
        .eq("modelo_id", modeloId)
        .then(({ data }: { data: VersionRow[] | null }) => {
          setGeneraciones(agruparEnGeneraciones(data || []));
          setLoading(false);
        });
    }
  }, [modeloId]);

  useEffect(() => { if (!marcaId) setStep(0); }, [marcaId]);
  useEffect(() => { if (marcaId && !modeloId) setStep(1); }, [marcaId, modeloId]);

  const listStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 0,
    maxHeight: 340, overflowY: "auto", borderRadius: 8,
  };

  const rowBtnStyle: React.CSSProperties = {
    fontSize: 18, fontWeight: 400, padding: "20px 32px",
    border: "none", borderBottom: "1px solid #ececec",
    background: "#fff", color: "#222", textAlign: "left",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "space-between", transition: "background 0.15s",
  };

  const backBtnStyle: React.CSSProperties = {
    color: "#2563eb", background: "none", border: "none",
    fontWeight: 600, fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  };

  // Comprueba si una generación ya fue seleccionada completamente
  const isGenSelected = (gen: GeneracionRow) =>
    gen.versiones.every((v) => selectedVersiones.some((sel) => sel.id === v.id));

  // Agrega o quita todas las versiones de una generación
  function toggleGen(gen: GeneracionRow) {
    if (isGenSelected(gen)) {
      setSelectedVersiones(selectedVersiones.filter((sel) => !gen.versiones.some((v) => v.id === sel.id)));
    } else {
      const nuevas = gen.versiones.filter((v) => !selectedVersiones.some((sel) => sel.id === v.id));
      setSelectedVersiones([...selectedVersiones, ...nuevas]);
    }
  }

  const selectedGens = selectedEnGeneraciones(selectedVersiones);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 0, boxShadow: "0 2px 12px #0001", marginBottom: 24, maxWidth: 520, margin: "0 auto" }}>
      <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 0 0", textAlign: "left", color: "#222", padding: "32px 32px 20px 32px" }}>
        Seleccioná el vehículo
      </h3>

      {loading && <div style={{ padding: "0 32px 18px 32px", color: "#888" }}>Cargando...</div>}

      {/* Paso 0: Marca */}
      {!loading && step === 0 && (
        <div style={listStyle}>
          {marcas.map((m) => (
            <button key={m.id} type="button"
              onClick={() => { setMarcaId(m.id); setStep(1); }}
              style={rowBtnStyle}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <span>{m.nombre}</span>
              <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
            </button>
          ))}
        </div>
      )}

      {/* Paso 1: Modelo */}
      {!loading && step === 1 && (
        <>
          <div style={listStyle}>
            {modelos.map((mo) => (
              <button key={mo.id} type="button"
                onClick={() => { setModeloId(mo.id); setStep(2); }}
                style={rowBtnStyle}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <span>{mo.nombre}</span>
                <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
              </button>
            ))}
          </div>
          <div style={{ margin: "18px 32px 24px 32px" }}>
            <button type="button"
              onClick={() => { setMarcaId(null); setModeloId(null); setModelos([]); setGeneraciones([]); }}
              style={backBtnStyle}
            >
              <span style={{ fontSize: 20 }}>&larr;</span> Volver a marcas
            </button>
          </div>
        </>
      )}

      {/* Paso 2: Generaciones */}
      {!loading && step === 2 && (
        <>
          <div style={listStyle}>
            {generaciones.map((gen) => {
              const selected = isGenSelected(gen);
              const rangoAnios = gen.anio_desde === gen.anio_hasta
                ? String(gen.anio_desde)
                : `${gen.anio_desde}–${gen.anio_hasta}`;
              return (
                <button key={gen.key} type="button"
                  onClick={() => toggleGen(gen)}
                  style={{
                    ...rowBtnStyle,
                    background: selected ? "#eff6ff" : "#fff",
                    borderLeft: selected ? "3px solid #2563eb" : "3px solid transparent",
                  }}
                  onMouseOver={(e) => { if (!selected) e.currentTarget.style.background = "#f5f6fa"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = selected ? "#eff6ff" : "#fff"; }}
                >
                  <span>
                    <span style={{ fontWeight: 600 }}>{gen.version}</span>
                    <span style={{ color: "#888", fontWeight: 400, marginLeft: 10, fontSize: 15 }}>
                      {rangoAnios}{gen.motor_codigo ? ` · ${gen.motor_codigo}` : ""}
                    </span>
                  </span>
                  <span style={{ fontSize: 22, color: selected ? "#2563eb" : "#bdbdbd", fontWeight: 700 }}>
                    {selected ? "✓" : "＋"}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ margin: "18px 32px 8px 32px" }}>
            <button type="button"
              onClick={() => { setModeloId(null); setGeneraciones([]); }}
              style={backBtnStyle}
            >
              <span style={{ fontSize: 20 }}>&larr;</span> Volver a modelos
            </button>
          </div>
        </>
      )}

      {/* Seleccionados — agrupados por generación */}
      {selectedGens.length > 0 && (
        <div style={{ padding: "16px 32px", borderTop: "1px solid #ececec", background: "#f8fafc" }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: "#222", fontSize: 15 }}>
            Compatibilidad seleccionada ({selectedVersiones.length} versión{selectedVersiones.length !== 1 ? "es" : ""}):
          </div>
          {selectedGens.map((gen) => {
            const rangoAnios = gen.anio_desde === gen.anio_hasta
              ? String(gen.anio_desde)
              : `${gen.anio_desde}–${gen.anio_hasta}`;
            return (
              <div key={gen.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <span style={{ fontSize: 15 }}>
                  <span style={{ fontWeight: 600 }}>{gen.version}</span>
                  <span style={{ color: "#888", marginLeft: 8 }}>
                    {rangoAnios}{gen.motor_codigo ? ` · ${gen.motor_codigo}` : ""}
                  </span>
                </span>
                <button type="button"
                  onClick={() => setSelectedVersiones(selectedVersiones.filter((sel) => !gen.versiones.some((v) => v.id === sel.id)))}
                  style={{ color: "#dc2626", background: "none", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}
                >
                  Quitar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Navegación */}
      <div style={{ display: "flex", gap: 8, margin: "20px 32px 24px 32px" }}>
        <button type="button" onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", fontSize: 16 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> Atrás
        </button>
        <button type="button" onClick={onNext}
          disabled={selectedVersiones.length === 0}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: selectedVersiones.length === 0 ? "not-allowed" : "pointer", opacity: selectedVersiones.length === 0 ? 0.5 : 1 }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductForm: React.FC<Props> = ({ vendedorId, supabaseUrl, supabaseKey }) => {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseKey),
    [supabaseUrl, supabaseKey]
  );

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Paso 1
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [tiposPieza, setTiposPieza] = useState<TipoPieza[]>([]);
  const [tiposLoaded, setTiposLoaded] = useState(false);
  const [grupoId, setGrupoId] = useState<number | "">("");
  const [grupoNombre, setGrupoNombre] = useState("");
  const [subgrupoId, setSubgrupoId] = useState<number | "">("");
  const [subgrupoNombre, setSubgrupoNombre] = useState("");
  const [tipoPiezaId, setTipoPiezaId] = useState<number | "">("");
  const [tipoPiezaNombre, setTipoPiezaNombre] = useState("");

  // Paso 2
  const [selectedVersiones, setSelectedVersiones] = useState<VersionRow[]>([]);

  // Paso 3
  const [nombre, setNombre] = useState("");
  const [numeroParteOem, setNumeroParteOem] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">(0);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch ─────────────────────────────────────────────────

  const fetchGrupos = async () => {
    const { data } = await supabase.from("grupos").select("*").order("orden");
    setGrupos(data || []);
  };

  const fetchSubgrupos = async (id: number) => {
    const { data } = await supabase.from("subgrupos").select("*").eq("grupo_id", id).order("orden");
    setSubgrupos(data || []);
  };

  const fetchTipos = async (id: number) => {
    setTiposLoaded(false);
    const { data } = await supabase
      .from("tipos_pieza")
      .select("*")
      .eq("subgrupo_id", id)
      .order("orden");
    setTiposPieza(data || []);
    setTiposLoaded(true); // ← recién ahora se puede evaluar si hay tipos o no
  };

  // ─── Effects ───────────────────────────────────────────────

  useEffect(() => { fetchGrupos(); }, []);

  useEffect(() => {
    if (grupoId) {
      setSubgrupoId("");
      setTipoPiezaId("");
      setTipoPiezaNombre("");
      setSubgrupos([]);
      setTiposPieza([]);
      setTiposLoaded(false);
      fetchSubgrupos(Number(grupoId));
    }
  }, [grupoId]);

  useEffect(() => {
    if (subgrupoId) {
      setTipoPiezaId("");
      setTipoPiezaNombre("");
      setTiposPieza([]);
      setTiposLoaded(false);
      fetchTipos(Number(subgrupoId));
    }
  }, [subgrupoId]);

  // Auto-avanzar a compatibilidad SOLO cuando la carga terminó y no hay tipos definidos
  useEffect(() => {
    if (step === 1 && subgrupoId && tiposLoaded && tiposPieza.length === 0) {
      setStep(2);
    }
  }, [tiposLoaded, tiposPieza.length, subgrupoId, step]);

  // ─── Handlers ──────────────────────────────────────────────

  const resetForm = () => {
    setStep(1);
    setGrupoId(""); setGrupoNombre("");
    setSubgrupoId(""); setSubgrupoNombre("");
    setTipoPiezaId(""); setTipoPiezaNombre("");
    setTiposLoaded(false);
    setSelectedVersiones([]);
    setNombre("");
    setMarca("");
    setPrecio("");
    setStock(0);
    setImageFiles([null, null, null]);
    setImagePreviews([null, null, null]);
    setSuccess(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newFiles = [...imageFiles] as (File | null)[];
    newFiles[index] = file;
    setImageFiles(newFiles);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newPreviews = [...imagePreviews] as (string | null)[];
      newPreviews[index] = ev.target?.result as string;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
    // Reset the input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles] as (File | null)[];
    const newPreviews = [...imagePreviews] as (string | null)[];
    newFiles[index] = null;
    newPreviews[index] = null;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingSubmit) return;

    const precioNum = Number(precio);
    const stockNum = Number(stock);

    if (!nombre.trim()) return setError("El nombre del producto es requerido");
    if (!marca.trim()) return setError("La marca es requerida");
    if (!precioNum || precioNum <= 0) return setError("El precio es inválido");
    if (stockNum < 0) return setError("El stock no puede ser negativo");

    setLoadingSubmit(true);
    setError(null);

    // Paths subidos a Storage — guardamos para rollback en caso de error
    const uploadedPaths: string[] = [];
    let primaryImageUrl: string | null = null;

    try {
      const skuGenerado = `SKU-${Date.now()}`;

      const { data: producto, error: insertError } = await supabase
        .from("productos")
        .insert([{
          sku: skuGenerado,
          producto: nombre.trim(),
          tipo_pieza_id: tipoPiezaId ? Number(tipoPiezaId) : null,
          grupo_id: Number(grupoId) || null,
          subgrupo_id: Number(subgrupoId) || null,
          marca_pieza: marca.trim(),
          numero_parte_oem: numeroParteOem.trim() || null,
          precio: precioNum,
          stock: stockNum,
          vendedor_id: vendedorId,
          activo: true,
          liquidacion: false,
        }])
        .select()
        .single();

      if (insertError || !producto) {
        throw new Error(insertError?.message || "Error al guardar el producto. Verificá los permisos del vendedor.");
      }

      const productoId = (producto as any).id as number;

      // Guardar compatibilidades
      if (selectedVersiones.length > 0) {
        const { error: compatError } = await supabase
          .from("compatibilidades")
          .insert(selectedVersiones.map((v) => ({
            producto_id: productoId,
            version_id: v.id,
          })));
        if (compatError) console.warn("Compatibilidades:", compatError.message);
      }

      // Subir imágenes (con rollback si alguna falla)
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file) continue;
        try {
          const { path, publicUrl } = await uploadProductImage({
            supabase,
            file,
            productoId,
            vendedorId,
            orden: i + 1,
          });
          uploadedPaths.push(path);
          if (i === 0) {
            primaryImageUrl = publicUrl;
          }
        } catch (imgErr: any) {
          // Rollback: eliminar el producto y los paths ya subidos
          await supabase.from("productos").delete().eq("id", productoId);
          await deleteProductImages(supabase, uploadedPaths);
          throw new Error(`Error subiendo imagen ${i + 1}: ${imgErr.message}`);
        }
      }

      if (primaryImageUrl) {
        const { error: imageUpdateError } = await supabase
          .from("productos")
          .update({ imagen_url: primaryImageUrl })
          .eq("id", productoId);

        if (imageUpdateError) {
          throw new Error(`No se pudo guardar la imagen principal: ${imageUpdateError.message}`);
        }
      }

      setSuccess(`✓ Producto "${nombre}" cargado correctamente`);
      containerRef.current?.scrollIntoView({ behavior: "smooth" });
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ─── Shared styles ─────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: 0,
    boxShadow: "0 2px 12px #0001",
    marginBottom: 24,
    maxWidth: 520,
    margin: "0 auto",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 18px 0",
    textAlign: "left",
    color: "#222",
    padding: "32px 32px 0 32px",
  };

  const rowBtnStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 400,
    padding: "22px 32px",
    border: "none",
    borderBottom: "1px solid #ececec",
    background: "#fff",
    color: "#222",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background 0.15s",
  };

  const backBtnStyle: React.CSSProperties = {
    color: "#2563eb",
    background: "none",
    border: "none",
    fontWeight: 600,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    maxHeight: 400,
    overflowY: "auto",
    borderRadius: 8,
  };

  const inputStyle: React.CSSProperties = {
    background: "#fff",
    color: "#222",
    border: "1px solid #bbb",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  };

  // ─── UI ────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ maxWidth: 560, margin: "auto", padding: "24px 16px" }}>
      <h2 style={{ marginBottom: 24 }}>Cargar producto</h2>
      <StepBar current={step} />

      {error && (
        <div style={{ color: "#dc2626", marginBottom: 12, padding: "10px 16px", background: "#fef2f2", borderRadius: 6 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: "#16a34a", marginBottom: 12, padding: "10px 16px", background: "#f0fdf4", borderRadius: 6 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── PASO 1: Categoría ── */}
        {step === 1 && (
          <>
            {/* 1a: Elegir Grupo */}
            {!grupoId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {grupos.map((g) => (
                    <button key={g.id} type="button"
                      onClick={() => { setGrupoId(g.id); setGrupoNombre(g.nombre); }}
                      style={rowBtnStyle}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <span>{g.nombre}</span>
                      <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1b: Elegir Subgrupo */}
            {grupoId && !subgrupoId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {subgrupos.map((s) => (
                    <button key={s.id} type="button"
                      onClick={() => { setSubgrupoId(s.id); setSubgrupoNombre(s.nombre); }}
                      style={rowBtnStyle}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <span>{s.nombre}</span>
                      <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: "20px 32px 28px 32px" }}>
                  <button type="button" onClick={() => { setGrupoId(""); setGrupoNombre(""); }} style={backBtnStyle}>
                    <span style={{ fontSize: 22 }}>&larr;</span> Volver a grupos
                  </button>
                </div>
              </div>
            )}

            {/* 1c: Cargando tipos */}
            {grupoId && subgrupoId && !tiposLoaded && (
              <div style={{ ...cardStyle, padding: "32px", textAlign: "center", color: "#888" }}>
                Cargando opciones...
              </div>
            )}

            {/* 1d: Elegir Tipo de pieza */}
            {grupoId && subgrupoId && tiposLoaded && tiposPieza.length > 0 && !tipoPiezaId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {tiposPieza.map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => { setTipoPiezaId(t.id); setTipoPiezaNombre(t.nombre); }}
                      style={rowBtnStyle}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <span>{t.nombre}</span>
                      <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: "20px 32px 28px 32px" }}>
                  <button type="button" onClick={() => { setSubgrupoId(""); setSubgrupoNombre(""); }} style={backBtnStyle}>
                    <span style={{ fontSize: 22 }}>&larr;</span> Volver a subgrupos
                  </button>
                </div>
              </div>
            )}

            {/* 1e: Resumen de categoría + Siguiente */}
            {grupoId && subgrupoId && tiposLoaded && (tipoPiezaId || tiposPieza.length === 0) && (
              <div style={cardStyle}>
                {/* Breadcrumb de la selección */}
                <div style={{ padding: "28px 32px 0 32px" }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Categoría seleccionada
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 14px", fontWeight: 600, color: "#222", fontSize: 15 }}>
                      {grupoNombre}
                    </span>
                    <span style={{ color: "#bdbdbd", fontSize: 18 }}>›</span>
                    <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 14px", fontWeight: 600, color: "#222", fontSize: 15 }}>
                      {subgrupoNombre}
                    </span>
                    {tipoPiezaNombre && (
                      <>
                        <span style={{ color: "#bdbdbd", fontSize: 18 }}>›</span>
                        <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", fontWeight: 700, color: "#1d4ed8", fontSize: 15 }}>
                          {tipoPiezaNombre}
                        </span>
                      </>
                    )}
                  </div>
                  {tipoPiezaNombre && (
                    <button type="button"
                      onClick={() => { setTipoPiezaId(""); setTipoPiezaNombre(""); }}
                      style={{ color: "#6b7280", background: "none", border: "none", fontSize: 13, cursor: "pointer", marginTop: 10, padding: 0, textDecoration: "underline" }}
                    >
                      Cambiar tipo de pieza
                    </button>
                  )}
                </div>

                {/* Botón Siguiente */}
                <div style={{ padding: "24px 32px 28px 32px" }}>
                  <button type="button" onClick={() => setStep(2)}
                    style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "16px 0", fontWeight: 700, fontSize: 18, cursor: "pointer", width: "100%" }}
                  >
                    Siguiente: Compatibilidad →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PASO 2: Compatibilidad ── */}
        {step === 2 && (
          <VehicleSelectorHierarchical
            supabase={supabase}
            selectedVersiones={selectedVersiones}
            setSelectedVersiones={setSelectedVersiones}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* ── PASO 3: Datos del producto ── */}
        {step === 3 && (
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Datos del producto</h3>
            <div style={{ padding: "24px 32px 32px 32px" }}>

              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre</label>
              <input
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={inputStyle}
              />

              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
                Número de parte OEM
              </label>
              <input
                placeholder="OEM (opcional)"
                value={numeroParteOem}
                onChange={(e) => setNumeroParteOem(e.target.value)}
                style={inputStyle}
              />

              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Marca</label>
              <input
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
                style={inputStyle}
              />

              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Precio</label>
              <input
                type="number"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value ? Number(e.target.value) : "")}
                min={0}
                required
                style={inputStyle}
              />

              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                min={0}
                required
                style={inputStyle}
              />

              {/* ── Fotos del producto ── */}
              <label style={{ fontWeight: 600, display: "block", marginBottom: 10, marginTop: 4 }}>
                Fotos del producto <span style={{ fontWeight: 400, color: "#888", fontSize: 14 }}>(hasta 3)</span>
              </label>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, position: "relative" }}>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        aspectRatio: "1",
                        border: imagePreviews[i] ? "2px solid #2563eb" : "2px dashed #bbb",
                        borderRadius: 10,
                        background: imagePreviews[i] ? "transparent" : "#f8fafc",
                        cursor: "pointer",
                        overflow: "hidden",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {imagePreviews[i] ? (
                        <img
                          src={imagePreviews[i]!}
                          alt={`Foto ${i + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "#bbb", userSelect: "none" }}>
                          <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 4 }}>+</div>
                          <div style={{ fontSize: 12 }}>Foto {i + 1}</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(e, i)}
                      />
                    </label>
                    {imagePreviews[i] && (
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          border: "none",
                          fontSize: 16,
                          lineHeight: 1,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                        title="Quitar foto"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>&larr;</span> Atrás
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 28px",
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: loadingSubmit ? "not-allowed" : "pointer",
                    opacity: loadingSubmit ? 0.7 : 1,
                  }}
                >
                  {loadingSubmit ? "Guardando..." : "Publicar producto"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
