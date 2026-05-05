
'use client'
import React, { useState } from "react";

const initialState = {
  nombre: "",
  cuit: "",
  afip: "",
  ubicacion: "",
  telefono: "",
  email: "",
  negocio: "",
  rubros: "",
  cantidad: "",
  local: "",
  otrosCanales: "",
  terminos: false,
};

export default function SolicitudVendedorForm() {
  const [form, setForm] = useState(initialState);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.terminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    // Construir mensaje para WhatsApp o email
    const mensaje =
      `Nueva solicitud de vendedor:\n` +
      `Nombre/Razón social: ${form.nombre}\n` +
      `CUIT: ${form.cuit}\n` +
      `Condición AFIP: ${form.afip}\n` +
      `Ubicación: ${form.ubicacion}\n` +
      `Teléfono: ${form.telefono}\n` +
      `Email: ${form.email}\n` +
      `Negocio/marca: ${form.negocio}\n` +
      `Rubros: ${form.rubros}\n` +
      `Cantidad productos: ${form.cantidad}\n` +
      `Local/físico: ${form.local}\n` +
      `Otros canales: ${form.otrosCanales}`;

    // WhatsApp (reemplaza X por tu número)
    const numero = "5491134543010"; // Código país+área+número (Argentina)
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    setEnviado(true);
    setForm(initialState);
  };

  if (enviado)
    return (
      <div style={{ padding: 24, background: "#f0fdf4", borderRadius: 8 }}>
        ¡Solicitud enviada! Te contactaremos pronto.
      </div>
    );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: "auto", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 12px #0001", color: "#111" }}>
      <h2 style={{ marginBottom: 18 }}>Solicitar ser vendedor</h2>
      <label style={{ color: "#111" }}>Nombre completo o razón social*<br />
        <input name="nombre" value={form.nombre} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>CUIT*<br />
        <input name="cuit" value={form.cuit} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Condición ante AFIP*<br />
        <input name="afip" value={form.afip} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Provincia y ciudad desde donde despacha*<br />
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Teléfono (WhatsApp)*<br />
        <input name="telefono" value={form.telefono} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Email*<br />
        <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Nombre de su negocio o marca*<br />
        <input name="negocio" value={form.negocio} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>Marcas o rubros principales*<br />
        <input name="rubros" value={form.rubros} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>¿Cuántos productos aproximadamente tiene para publicar?*<br />
        <input name="cantidad" value={form.cantidad} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>¿Tiene local físico, depósito o vende desde casa?*<br />
        <input name="local" value={form.local} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ color: "#111" }}>¿Ya vende en otros marketplaces o canales? ¿Cuáles?<br />
        <input name="otrosCanales" value={form.otrosCanales} onChange={handleChange} style={{ width: "100%", marginBottom: 10, color: "#111", background: "#fff", border: "1px solid #ccc" }} />
      </label>
      <label style={{ display: "flex", alignItems: "center", marginBottom: 10, color: "#111" }}>
        <input type="checkbox" name="terminos" checked={form.terminos} onChange={handleChange} required style={{ marginRight: 8 }} />
        Acepto los términos y condiciones
      </label>
      {error && <div style={{ color: "#dc2626", marginBottom: 10 }}>{error}</div>}
      <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
        Enviar solicitud
      </button>
    </form>
  );
}
