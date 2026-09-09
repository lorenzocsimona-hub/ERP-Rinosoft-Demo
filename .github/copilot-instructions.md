# Instrucciones del proyecto Rinosoft

## Estado actual

- Es una SPA de JavaScript vanilla con HTML/CSS y renderizado imperativo; no hay React, JSX, TypeScript, bundler, `package.json` ni backend.
- No describas el proyecto como React/JSX ni agregues dependencias de npm salvo que el usuario solicite explícitamente una migración.
- Consulta [README.md](../README.md) para la estructura de datos y [Resumen-plataforma-Rinosoft.rtf](../Resumen-plataforma-Rinosoft.rtf) para el alcance funcional.

## Arquitectura y contratos

- [index.html](../index.html) define la página pública, el acceso y los contenedores de la SPA.
- [app.js](../app.js) concentra el estado, la carga y normalización de `db.json`, permisos, renderizado, eventos, cálculos y persistencia.
- [styles.css](../styles.css) contiene los estilos de ambas áreas; conserva las clases que genera `app.js`.
- `db.json` es la semilla. `start()` restaura datos desde `localStorage` y termina llamando a `render()`.
- Conserva los IDs, `name`, `data-*`, clases, vistas de `labels` y nombres de colecciones que consume `app.js`, especialmente `public-home`, `platform-login`, `app`, `main-nav`, `content`, `user-select`, `export-backup`, `import-backup` y `backup-file`.
- Las vistas reemplazan `#content.innerHTML` y vuelven a enlazar eventos. Al modificar markup, revisa las funciones `bind*` cercanas y no supongas que los listeners sobreviven a un render.

## Datos y persistencia

- Usa fechas `YYYY-MM-DD`, marcas de auditoría ISO, moneda MXN, estados internos en mayúsculas y permisos con formato `recurso.acción` o `recurso.*`.
- Conserva los prefijos de IDs existentes (`USR-`, `EMP-`, `CLI-`, `CT-`, `OC-`, `PRY-`, `FAC-`, `PAG-`, `PRD-`, `MOV-`, entre otros).
- Los cambios se guardan en el navegador con claves `rinosoft.*`; no hay sincronización entre usuarios o dispositivos.
- Al mutar `state.db`, usa `persistLocalData()` o `persistCollection()` y llama a `render()` siguiendo el patrón local.
- Revisa las normalizaciones de `start()` antes de cambiar una colección. `invoiceRequests` y `vacationRequests` son los nombres implementados actualmente; no los sustituyas automáticamente por `billingRequests` o `leaveRequests` de datos antiguos.
- Los respaldos se importan y exportan desde el navegador. `Respaldos/` está excluido por [.gitignore](../.gitignore) y no es la fuente de datos en ejecución.

## Ejecución y validación

Sirve la raíz por HTTP porque `app.js` hace `fetch('db.json')`:

```powershell
python -m http.server 8000
```

Abre `http://localhost:8000/`; no uses `file://`.

Antes de terminar cambios, ejecuta:

```powershell
node --check app.js
python -c "import json; json.load(open('db.json', encoding='utf-8')); print('db.json valido')"
```

No hay pruebas automatizadas. Para cambios de comportamiento, valida en el navegador la vista afectada, los permisos por rol, la persistencia tras recargar y la importación/exportación de respaldos. Limpia el `localStorage` del sitio cuando necesites probar desde la semilla.

## Límites y riesgos

- La autenticación y los permisos se ejecutan en el cliente; las contraseñas están en texto plano en `db.json`. Es una demo local, no un sistema de producción.
- Muchos valores llegan a `innerHTML`; escapa o valida entradas antes de interpolarlas y revisa especialmente nombres, descripciones, archivos y motivos.
- Los adjuntos se guardan como Data URLs en `localStorage` y pueden superar la cuota del navegador.
- Mantén las relaciones entre entidades y las reglas fiscales existentes: IVA `EXEMPT`, `RATE_0`, `RATE_8`, `RATE_16`; retenciones porcentuales o por importe; contratos, órdenes de cambio y estimaciones.
