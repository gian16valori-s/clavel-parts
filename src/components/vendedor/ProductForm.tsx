import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

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

function VehicleSelectorHierarchical({
  supabase,
  selectedVersiones,
  setSelectedVersiones,
  onBack,
  onNext,
}: {
  supabase: any;
  selectedVersiones: any[];
  setSelectedVersiones: (v: any[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [step, setStep] = useState(0); // 0: marca, 1: modelo, 2: version
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [versiones, setVersiones] = useState<VersionRow[]>([]);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [modeloId, setModeloId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("marcas").select("*").order("nombre");
      setMarcas(data || []);
      setLoading(false);
    })();
  }, []);

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

  useEffect(() => {
    if (modeloId) {
      setLoading(true);
      supabase
        .from("versiones")
        .select("*")
        .eq("modelo_id", modeloId)
        .order("anio", { ascending: false })
        .then(({ data }: { data: VersionRow[] | null }) => {
          setVersiones(data || []);
          setLoading(false);
        });
    }
  }, [modeloId]);

  useEffect(() => {
    if (!marcaId) setStep(0);
  }, [marcaId]);

  useEffect(() => {
    if (marcaId && !modeloId) setStep(1);
  }, [marcaId, modeloId]);

  const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    maxHeight: 320,
    overflowY: "auto",
    borderRadius: 8,
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

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 0,
        boxShadow: "0 2px 12px #0001",
        marginBottom: 24,
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <h3
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 18px 0",
          textAlign: "left",
          color: "#222",
          padding: "32px 32px 0 32px",
        }}
      >
        Seleccioná el vehículo
      </h3>

      {loading && <div style={{ padding: "0 32px 18px 32px", color: "#888" }}>Cargando...</div>}

      {/* Paso 0: Marca */}
      {!loading && step === 0 && (
        <div style={listStyle}>
          {marcas.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMarcaId(m.id);
                setStep(1);
              }}
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
              <button
                key={mo.id}
                type="button"
                onClick={() => {
                  setModeloId(mo.id);
                  setStep(2);
                }}
                style={rowBtnStyle}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <span>{mo.nombre}</span>
                <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
              </button>
            ))}
          </div>
          <div style={{ margin: "18px 32px 0 32px", textAlign: "left" }}>
            <button
              type="button"
              onClick={() => {
                setMarcaId(null);
                setModeloId(null);
                setModelos([]);
                setVersiones([]);
              }}
              style={backBtnStyle}
            >
              <span style={{ fontSize: 22 }}>&larr;</span> Volver a marcas
            </button>
          </div>
        </>
      )}

      {/* Paso 2: Versión */}
      {!loading && step === 2 && (
        <>
          <div style={listStyle}>
            {versiones.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  if (!selectedVersiones.some((sel) => sel.id === v.id)) {
                    setSelectedVersiones([...selectedVersiones, v]);
                  }
                }}
                style={{ ...rowBtnStyle, fontSize: 18, padding: "18px 32px" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <span>
                  <span style={{ fontWeight: 600 }}>{v.version}</span>
                  <span style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}>
                    {v.anio} {v.motor_codigo ? `| ${v.motor_codigo}` : ""}
                  </span>
                </span>
                <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#43;</span>
              </button>
            ))}
          </div>
          <div style={{ margin: "18px 32px 0 32px", textAlign: "left" }}>
            <button
              type="button"
              onClick={() => {
                setModeloId(null);
                setVersiones([]);
              }}
              style={backBtnStyle}
            >
              <span style={{ fontSize: 22 }}>&larr;</span> Volver a modelos
            </button>
          </div>
        </>
      )}

      {/* Seleccionados */}
      {selectedVersiones.length > 0 && (
        <div
          style={{
            padding: "18px 32px",
            borderTop: "1px solid #ececec",
            background: "#f8fafc",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, color: "#222" }}>Seleccionados:</div>
          {selectedVersiones.map((v) => (
            <div
              key={v.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span>
                {v.version}{" "}
                <span style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}>
                  {v.anio} {v.motor_codigo ? `| ${v.motor_codigo}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setSelectedVersiones(selectedVersiones.filter((sel) => sel.id !== v.id))
                }
                style={{
                  color: "#dc2626",
                  background: "none",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: "pointer",
                  marginLeft: 8,
                }}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navegación */}
      <div style={{ display: "flex", gap: 8, margin: "24px 32px 24px 32px" }}>
        <button
          type="button"
          onClick={onBack}
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
          type="button"
          onClick={onNext}
          disabled={selectedVersiones.length === 0}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "10px 28px",
            fontWeight: 600,
            fontSize: 18,
            cursor: selectedVersiones.length === 0 ? "not-allowed" : "pointer",
          }}
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
  const [grupoId, setGrupoId] = useState<number | "">("");
  const [subgrupoId, setSubgrupoId] = useState<number | "">("");
  const [tipoPiezaId, setTipoPiezaId] = useState<number | "">("");

  // Paso 2
  const [selectedVersiones, setSelectedVersiones] = useState<any[]>([]);

  // Paso 3
  const [nombre, setNombre] = useState("");
  const [numeroParteOem, setNumeroParteOem] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">(0);

  // ─── Fetch ─────────────────────────────────────────────────

  const fetchGrupos = async () => {
    const { data } = await supabase.from("grupos").select("*").order("nombre");
    setGrupos(data || []);
  };

  const fetchSubgrupos = async (id: number) => {
    const { data } = await supabase.from("subgrupos").select("*").eq("grupo_id", id);
    setSubgrupos(data || []);
  };

  const fetchTipos = async (id: number) => {
    const { data } = await supabase
      .from("tipos_pieza")
      .select("*")
      .eq("subgrupo_id", id)
      .order("orden");
    setTiposPieza(data || []);
  };

  // ─── Effects ───────────────────────────────────────────────

  useEffect(() => {
    fetchGrupos();
  }, []);

  useEffect(() => {
    if (grupoId) {
      setSubgrupoId("");
      setTipoPiezaId("");
      setSubgrupos([]);
      setTiposPieza([]);
      fetchSubgrupos(Number(grupoId));
    }
  }, [grupoId]);

  useEffect(() => {
    if (subgrupoId) {
      setTipoPiezaId("");
      setTiposPieza([]);
      fetchTipos(Number(subgrupoId));
    }
  }, [subgrupoId]);

  // Saltar paso automáticamente si no hay tipos de pieza
  useEffect(() => {
    if (step === 1 && subgrupoId && tiposPieza.length === 0) {
      setStep(2);
    }
  }, [tiposPieza, subgrupoId, step]);

  // ─── Handlers ──────────────────────────────────────────────

  const resetForm = () => {
    setStep(1);
    setGrupoId("");
    setSubgrupoId("");
    setTipoPiezaId("");
    setSelectedVersiones([]);
    setNombre("");
    setMarca("");
    setPrecio("");
    setStock(0);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingSubmit) return;

    const precioNum = Number(precio);
    const stockNum = Number(stock);

    if (!tipoPiezaId) return setError("Seleccioná tipo");
    if (!nombre.trim()) return setError("Nombre requerido");
    if (!marca.trim()) return setError("Marca requerida");
    if (!precioNum || precioNum <= 0) return setError("Precio inválido");
    if (stockNum < 0) return setError("Stock inválido");

    setLoadingSubmit(true);
    setError(null);

    try {
      const { data: producto } = await supabase
        .from("productos")
        .insert([
          {
            nombre,
            tipo_pieza_id: tipoPiezaId,
            numero_parte_oem: numeroParteOem || null,
            marca,
            precio: precioNum,
            stock: stockNum,
            vendedor_id: vendedorId,
          },
        ])
        .select()
        .single();

      if (selectedVersiones.length > 0) {
        await supabase.from("compatibilidades").insert(
          selectedVersiones.map((v) => ({
            producto_id: producto.id,
            version_id: v.id,
          }))
        );
      }

      setSuccess("Producto cargado");
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
    <div style={{ maxWidth: 560, margin: "auto", padding: "24px 16px" }}>
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
            {/* Grupo */}
            {!grupoId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {grupos.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrupoId(g.id)}
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

            {/* Subgrupo */}
            {grupoId && !subgrupoId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {subgrupos.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubgrupoId(s.id)}
                      style={rowBtnStyle}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <span>{s.nombre}</span>
                      <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: "24px 32px 32px 32px" }}>
                  <button
                    type="button"
                    onClick={() => setGrupoId("")}
                    style={backBtnStyle}
                  >
                    <span style={{ fontSize: 22 }}>&larr;</span> Volver a grupos
                  </button>
                </div>
              </div>
            )}

            {/* Tipo de pieza */}
            {grupoId && subgrupoId && tiposPieza.length > 0 && !tipoPiezaId && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>¿Qué opción lo describe?</h3>
                <div style={listStyle}>
                  {tiposPieza.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTipoPiezaId(t.id);
                      }}
                      style={rowBtnStyle}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <span>{t.nombre}</span>
                      <span style={{ fontSize: 22, color: "#bdbdbd" }}>&#8250;</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: "24px 32px 32px 32px" }}>
                  <button
                    type="button"
                    onClick={() => setSubgrupoId("")}
                    style={backBtnStyle}
                  >
                    <span style={{ fontSize: 22 }}>&larr;</span> Volver a subgrupos
                  </button>
                </div>
              </div>
            )}

            {/* Botón Siguiente */}
            {((grupoId && subgrupoId && tiposPieza.length === 0) ||
              (grupoId && subgrupoId && tipoPiezaId)) && (
              <div style={{ marginTop: 40, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "18px 48px",
                    fontWeight: 700,
                    fontSize: 22,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #0001",
                  }}
                >
                  Siguiente
                </button>
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

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
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
                  }}
                >
                  {loadingSubmit ? "Guardando..." : "Guardar"}
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
