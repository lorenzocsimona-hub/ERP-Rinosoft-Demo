const state = { db: null, activeUserId: 'USR-001', view: 'dashboard', workspaceOpen: false, selectedContractId: null, editingContractId: null, selectedEmployeeId: null, editingEmployeeId: null, selectedPositionKey: null, editingEstimateId: null, publicEmployeeId: null, publicWorkerId: null };

const labels = {
  dashboard: 'Panel general', clients: 'Clientes', contracts: 'Contratos', projects: 'Proyectos', finance: 'Finanzas', billing: 'Facturación', collections: 'Cobranza', purchases: 'Compras', masterCatalog: 'Catálogo maestro', warehouse: 'Almacén', people: 'Altas y expedientes', hrChanges: 'Bajas y modificaciones', hrPositions: 'Catálogo de puestos', hrIncidents: 'Incidencias', hrVacations: 'Vacaciones', reimbursements: 'Reembolsos'
};

const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
const byId = (items, id) => items.find(item => item.id === id);
const initials = name => name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
const statusLabel = status => ({ IN_PROGRESS: 'En ejecucion', SIGNED: 'Firmado', DRAFT: 'Borrador', IN_REVIEW: 'En revision', APPROVED: 'Aprobado', REJECTED: 'Rechazado', PLANNED: 'Planeado', PAID: 'Pagada', PARTIALLY_PAID: 'Pago parcial', RECEIVED: 'Recibida', PARTIALLY_RECEIVED: 'Recepcion parcial' }[status] || status);
const ivaOptions = [{ value: 'EXEMPT', label: 'Exento', rate: 0 }, { value: 'RATE_0', label: 'Tasa 0%', rate: 0 }, { value: 'RATE_8', label: 'Tasa 8%', rate: 0.08 }, { value: 'RATE_16', label: 'Tasa 16%', rate: 0.16 }];
const unitOptions = [{ value: 'PIECE', label: 'Pieza' }, { value: 'KILOGRAM', label: 'Kilogramo' }, { value: 'GRAM', label: 'Gramo' }, { value: 'METER', label: 'Metro' }, { value: 'SQUARE_METER', label: 'Metro cuadrado' }, { value: 'LITER', label: 'Litro' }, { value: 'BOX', label: 'Caja' }, { value: 'ROLL', label: 'Rollo' }, { value: 'SET', label: 'Juego' }, { value: 'SERVICE', label: 'Servicio' }, { value: 'OTHER', label: 'Otra' }];
const currentUnitOptions = () => state.db?.measurementUnits || unitOptions;
const unitLabel = value => currentUnitOptions().find(option => option.value === value)?.label || value || 'Sin unidad';
const reimbursementCategories = [{ value: 'FOOD', label: 'Alimentos' }, { value: 'GROUND_TRANSPORT', label: 'Transporte terrestre' }, { value: 'AIR_TRANSPORT', label: 'Transporte aéreo' }, { value: 'LODGING', label: 'Hospedaje' }, { value: 'EQUIPMENT', label: 'Equipo' }, { value: 'MATERIAL', label: 'Material' }, { value: 'TOOL', label: 'Herramienta' }];
const reimbursementCategoryLabel = value => reimbursementCategories.find(category => category.value === value)?.label || value;
const positionOptions = [{ value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Administra proyectos, avances y entregables.' }, { value: 'TECHNICIAN', label: 'Técnico', description: 'Ejecuta actividades técnicas y reporta consumos.' }, { value: 'MAINTENANCE_COORDINATOR', label: 'Coordinador de mantenimiento', description: 'Coordina servicios y mantenimiento especializado.' }, { value: 'ADMINISTRATIVE_ASSISTANT', label: 'Auxiliar administrativo', description: 'Apoya procesos administrativos y documentales.' }, { value: 'WAREHOUSE_OPERATOR', label: 'Operador de almacén', description: 'Registra entradas, salidas y existencias.' }];
const departmentOptions = [{ value: 'COM', label: 'Comercial y Contratos' }, { value: 'FIN', label: 'Administración y Finanzas' }, { value: 'RHH', label: 'Recursos Humanos' }, { value: 'CMP', label: 'Compras' }, { value: 'ALM', label: 'Almacén' }, { value: 'OPS', label: 'Operaciones y Proyectos' }, { value: 'DIR', label: 'Dirección General' }];
const workplaceOptions = [{ value: 'CENTRAL_OFFICE', label: 'Oficina Central' }, { value: 'WAREHOUSE', label: 'Almacén' }];
const workplaceLabel = value => workplaceOptions.find(option => option.value === value)?.label || value || 'Sin ubicación';
const departmentPositions = {
  COM: [{ value: 'COMMERCIAL_EXECUTIVE', label: 'Ejecutivo comercial', description: 'Gestiona clientes, cotizaciones y oportunidades.' }, { value: 'CONTRACTS_COORDINATOR', label: 'Coordinador de contratos', description: 'Administra contratos, cambios y formalización.' }],
  FIN: [{ value: 'ACCOUNTING_ANALYST', label: 'Analista contable', description: 'Registra facturación, pagos y conciliaciones.' }, { value: 'COLLECTIONS_ANALYST', label: 'Analista de cobranza', description: 'Da seguimiento a saldos y cobros.' }],
  RHH: [{ value: 'HR_ANALYST', label: 'Analista de Recursos Humanos', description: 'Administra expedientes, incidencias y vacaciones.' }, { value: 'PAYROLL_ANALYST', label: 'Analista de nómina', description: 'Calcula y controla la nómina.' }],
  CMP: [{ value: 'BUYER', label: 'Comprador', description: 'Gestiona proveedores y órdenes de compra.' }, { value: 'PURCHASING_COORDINATOR', label: 'Coordinador de compras', description: 'Coordina cotizaciones y autorizaciones de compra.' }],
  ALM: [{ value: 'WAREHOUSE_OPERATOR', label: 'Operador de almacén', description: 'Registra entradas, salidas y existencias.' }, { value: 'WAREHOUSE_SUPERVISOR', label: 'Supervisor de almacén', description: 'Controla inventarios y movimientos físicos.' }],
  OPS: [{ value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Administra proyectos, avances y entregables.' }, { value: 'TECHNICIAN', label: 'Técnico', description: 'Ejecuta actividades técnicas y reporta consumos.' }, { value: 'MAINTENANCE_COORDINATOR', label: 'Coordinador de mantenimiento', description: 'Coordina servicios y mantenimiento especializado.' }],
  DIR: [{ value: 'GENERAL_MANAGER', label: 'Director General', description: 'Autoriza y supervisa la operación general.' }]
};
const allDepartmentPositions = Object.values(departmentPositions).flat();
const departmentPosition = value => departmentPositions[value] || allDepartmentPositions;
const seniorityTable = [{ max: 1, vacation: 12, factor: 1.0493 }, { max: 2, vacation: 14, factor: 1.0507 }, { max: 3, vacation: 16, factor: 1.0521 }, { max: 4, vacation: 18, factor: 1.0534 }, { max: 5, vacation: 20, factor: 1.0548 }, { max: 10, vacation: 22, factor: 1.0562 }, { max: 15, vacation: 24, factor: 1.0575 }, { max: 20, vacation: 26, factor: 1.0589 }, { max: 25, vacation: 28, factor: 1.0603 }, { max: 30, vacation: 30, factor: 1.0616 }, { max: Infinity, vacation: 32, factor: 1.0630 }];
const positionLabel = value => positionOptions.find(position => position.value === value)?.label || value || 'Sin puesto';
const positionDescription = value => positionOptions.find(position => position.value === value)?.description || '';
const seniorityData = hireDate => { const years = Math.max(0, Math.floor((Date.now() - new Date(hireDate).getTime()) / 31557600000)); return { years, ...seniorityTable.find(row => years <= row.max) }; };
const ageFromCurp = curp => { const match = String(curp || '').toUpperCase().match(/^[A-Z]{4}(\d{2})(\d{2})(\d{2})/); if (!match) return null; const year = Number(match[1]) + (Number(match[1]) > Number(String(new Date().getFullYear()).slice(2)) ? 1900 : 2000); return new Date(year, Number(match[2]) - 1, Number(match[3])).toISOString().slice(0, 10); };
const ageFromBirthDate = date => { if (!date) return ''; const birth = new Date(date); const now = new Date(); return now.getFullYear() - birth.getFullYear() - ((now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) ? 1 : 0); };
const ivaLabel = type => ivaOptions.find(option => option.value === type)?.label || 'Tasa 16%';
const retentionRate = retention => typeof retention === 'number' ? retention : retention.mode === 'AMOUNT' ? 0 : Number(retention.value ?? retention.rate ?? 0);
const retentionValue = retention => typeof retention === 'number' ? 0 : Number(retention.value || 0);
const retentionMode = retention => typeof retention === 'number' ? 'PERCENTAGE' : retention.mode || 'PERCENTAGE';
const retentionConcept = retention => typeof retention === 'number' ? 'Retención general' : retention.concept;
const retentionTotal = (amount, retentions) => retentions.reduce((total, retention) => total + (retentionMode(retention) === 'AMOUNT' ? retentionValue(retention) : Math.abs(amount) * retentionRate(retention)), 0);
const retentionText = retentions => retentions.map(retention => `${retentionMode(retention) === 'AMOUNT' ? money(retentionValue(retention)) : `${retentionRate(retention) * 100}%`} · ${retentionConcept(retention)}`).join(' + ') || 'Sin retenciones';
const readRetentions = form => [...form.querySelectorAll('[data-retention-row]')].map(row => { const mode = row.querySelector('[name="retentionMode"]').value; const inputValue = numericValue(row.querySelector('[name="retentionValue"]').value); return { mode, value: mode === 'PERCENTAGE' ? inputValue / 100 : inputValue, concept: row.querySelector('[name="retentionConcept"]').value.trim() }; }).filter(retention => retention.value > 0 && retention.concept);
const fiscalAmounts = (subtotal, ivaType, advanceMode, advanceValue, retentions) => { const ivaRate = ivaOptions.find(option => option.value === ivaType)?.rate || 0; const ivaAmount = subtotal * ivaRate; const advanceAmount = advanceMode === 'AMOUNT' ? advanceValue : subtotal * advanceValue; const retentionAmount = retentionTotal(subtotal, retentions); return { ivaRate, ivaAmount, retentionAmount, netAmount: subtotal + ivaAmount - retentionAmount, advanceAmount }; };
const advanceText = contract => contract.advanceMode === 'AMOUNT' ? `${money(contract.advanceAmount || 0)} · Importe` : `${((contract.advancePercentage || 0) * 100).toFixed(2)}% · Porcentaje`;
const numericValue = value => Number(String(value || '').replace(/[^\d.-]/g, '')) || 0;
const formatInputValue = (value, format) => { const number = numericValue(value); if (!String(value).trim()) return ''; return format === 'percentage' ? `${number}%` : `$${number.toLocaleString('en-US', { maximumFractionDigits: 2 })}`; };
const readFiles = files => Promise.all([...files].map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, content: reader.result }); reader.onerror = reject; reader.readAsDataURL(file); })));
const fileSize = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const attachmentsHtml = attachments => attachments?.length ? `<div class="attachments-list">${attachments.map(file => `<a class="attachment-item" href="${file.content}" download="${file.name}" target="_blank"><strong>${file.name}</strong><small>${file.type} · ${fileSize(file.size)}</small></a>`).join('')}</div>` : '<p class="empty-note">Sin archivos de respaldo.</p>';

function showToast(message, type = 'success') {
  let container = document.querySelector('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast-close" type="button" aria-label="Cerrar">&times;</button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function getAvailableContractAdvance(contractId, currentEstimateId = null) {
  const contract = byId(state.db.contracts, contractId);
  if (!contract) return 0;
  const currentFiscal = fiscalAmounts(contract.originalAmount || contract.updatedAmount, contract.ivaType, contract.advanceMode || 'AMOUNT', contract.advanceMode === 'PERCENTAGE' ? (contract.advanceValue || 0) : (contract.advanceAmount || 0), contract.retentionRates || []);
  const totalAdvance = currentFiscal.advanceAmount || 0;
  const amortizedOther = state.db.projects.flatMap(p => p.estimates || []).filter(est => est.contractId === contractId && est.id !== currentEstimateId).reduce((sum, est) => sum + Number(est.amortization || 0), 0);
  return Math.max(0, totalAdvance - amortizedOther);
}

function recalculateContract(contract) {
  const changes = state.db.changeOrders.filter(order => order.contractId === contract.id && (order.approvalStatus || order.status) === 'APPROVED');
  const originalAmount = Number(contract.originalAmount || contract.originalSubtotal || 0);
  const changeAmount = changes.reduce((total, order) => total + Number(order.amount || order.subtotal || 0), 0);
  contract.changeOrderAmount = changeAmount;
  contract.updatedAmount = originalAmount + changeAmount;
  contract.billedAmount = Number(contract.billedAmount || 0);
  contract.collectedAmount = Number(contract.collectedAmount || 0);
  contract.pendingAmount = Math.max(0, contract.updatedAmount - contract.billedAmount);
  contract.netAmount = fiscalAmounts(contract.updatedAmount, contract.ivaType || 'RATE_16', contract.advanceMode || 'AMOUNT', contract.advanceMode === 'PERCENTAGE' ? Number(contract.advanceValue || 0) : Number(contract.advanceAmount || 0), contract.retentionRates || []).netAmount;
  changes.forEach(order => { order.appliedToContract = true; });
}

async function start() {
  state.db = await fetch('db.json').then(response => response.json());
  bindPublicHome();
  const savedActions = localStorage.getItem('rinosoft.pendingActions');
  const savedContracts = localStorage.getItem('rinosoft.contracts');
  const savedChangeOrders = localStorage.getItem('rinosoft.changeOrders');
  const savedClients = localStorage.getItem('rinosoft.clients');
  const savedProjects = localStorage.getItem('rinosoft.projects');
    const savedApprovalHistory = localStorage.getItem('rinosoft.approvalHistory');
    const savedInvoices = localStorage.getItem('rinosoft.invoices');
    const savedPayments = localStorage.getItem('rinosoft.payments');
    const savedPurchaseOrders = localStorage.getItem('rinosoft.purchaseOrders');
    const savedInventory = localStorage.getItem('rinosoft.inventory');
    const savedInventoryMovements = localStorage.getItem('rinosoft.inventoryMovements');
    const savedReimbursements = localStorage.getItem('rinosoft.reimbursements');
    const savedIncidents = localStorage.getItem('rinosoft.incidents');
    const savedVacationRequests = localStorage.getItem('rinosoft.vacationRequests');
    const savedEmployeeDocuments = localStorage.getItem('rinosoft.employeeDocuments');
    const savedTerminations = localStorage.getItem('rinosoft.terminations');
    const savedPositionCatalog = localStorage.getItem('rinosoft.positionCatalog');
    const savedPayroll = localStorage.getItem('rinosoft.payroll');
      const savedInvoiceRequests = localStorage.getItem('rinosoft.invoiceRequests');
    const savedMeasurementUnits = localStorage.getItem('rinosoft.measurementUnits');
  if (savedActions) state.db.pendingActions = JSON.parse(savedActions);
  if (savedContracts) state.db.contracts = JSON.parse(savedContracts);
  if (savedChangeOrders) state.db.changeOrders = JSON.parse(savedChangeOrders);
  if (savedClients) state.db.clients = JSON.parse(savedClients);
  if (savedProjects) state.db.projects = JSON.parse(savedProjects);
    if (savedInvoices) state.db.invoices = JSON.parse(savedInvoices);
    if (savedPayments) state.db.payments = JSON.parse(savedPayments);
    if (savedPurchaseOrders) state.db.purchaseOrders = JSON.parse(savedPurchaseOrders);
    if (savedInventory) state.db.inventory = JSON.parse(savedInventory);
    if (savedInventoryMovements) state.db.inventoryMovements = JSON.parse(savedInventoryMovements);
    if (savedReimbursements) state.db.reimbursements = JSON.parse(savedReimbursements);
    state.db.reimbursements ||= [];
    if (savedIncidents) state.db.incidents = JSON.parse(savedIncidents);
    if (savedVacationRequests) state.db.vacationRequests = JSON.parse(savedVacationRequests);
    if (savedEmployeeDocuments) state.db.employeeDocuments = JSON.parse(savedEmployeeDocuments);
    state.db.incidents ||= [];
    state.db.vacationRequests ||= [];
    state.db.employeeDocuments ||= [];
    if (savedTerminations) state.db.terminations = JSON.parse(savedTerminations);
    state.db.terminations ||= [];
    if (savedPositionCatalog) state.db.positionCatalog = JSON.parse(savedPositionCatalog);
    state.db.positionCatalog ||= allDepartmentPositions.map(position => ({ ...position, department: Object.entries(departmentPositions).find(([, positions]) => positions.some(item => item.value === position.value))?.[0] || '' }));
    if (savedPayroll) state.db.payroll = JSON.parse(savedPayroll);
    state.db.payroll ||= [];
    if (savedInvoiceRequests) state.db.invoiceRequests = JSON.parse(savedInvoiceRequests);
    state.db.invoiceRequests ||= [];
    if (savedMeasurementUnits) state.db.measurementUnits = JSON.parse(savedMeasurementUnits);
    state.db.inventoryMovements ||= [];
  state.db.approvalHistory = savedApprovalHistory ? JSON.parse(savedApprovalHistory) : [];
  state.db.contracts.forEach(contract => { contract.retentionRates ||= []; contract.retentionRates = contract.retentionRates.map(retention => typeof retention === 'number' ? { mode: 'PERCENTAGE', value: retention, concept: 'Retención general' } : { mode: retention.mode || 'PERCENTAGE', value: retention.value ?? retention.rate ?? 0, concept: retention.concept || 'Retención general' }); contract.ivaType ||= 'RATE_16'; contract.ivaRate ??= 0.16; contract.contractNumber ||= contract.id; contract.contractName ||= 'Contrato sin nombre'; contract.approvalStatus ||= 'APPROVED'; });
  state.db.changeOrders.forEach(order => { order.retentionRates ||= []; order.retentionRates = order.retentionRates.map(retention => typeof retention === 'number' ? { mode: 'PERCENTAGE', value: retention, concept: 'Retención general' } : { mode: retention.mode || 'PERCENTAGE', value: retention.value ?? retention.rate ?? 0, concept: retention.concept || 'Retención general' }); order.ivaType ||= 'RATE_16'; order.ivaRate ??= 0.16; order.approvalStatus ||= order.status === 'APPROVED' ? 'APPROVED' : 'IN_REVIEW'; });
  state.db.invoices.forEach(invoice => { invoice.folio ||= invoice.id; invoice.uuid ||= `UUID-DEMO-${invoice.id}`; invoice.ivaType ||= 'RATE_16'; });
  state.db.contracts.forEach(contract => { contract.attachments ||= []; });
  state.db.changeOrders.forEach(order => { order.attachments ||= []; });
  state.db.products.forEach(product => { product.unitOfMeasure ||= product.unit || 'PIECE'; });
  state.db.purchaseOrders.forEach(order => order.items?.forEach(item => { item.unitOfMeasure ||= byId(state.db.products, item.productId)?.unitOfMeasure || 'PIECE'; }));
  state.db.purchaseOrders.forEach(order => { order.attachments ||= []; order.approvalStatus ||= order.status === 'ORDERED' ? 'IN_REVIEW' : (order.status === 'APPROVED' ? 'APPROVED' : 'DRAFT'); });
  state.db.inventory.forEach(item => { item.unitOfMeasure ||= byId(state.db.products, item.productId)?.unitOfMeasure || 'PIECE'; });
  state.db.employees.forEach(employee => { employee.workerId ||= employee.employeeNumber; employee.positionKey ||= positionOptions.find(position => position.label === employee.position)?.value || employee.position; employee.positionDescription ||= positionDescription(employee.positionKey); employee.projectId ||= employee.assignedContractIds?.[0] || ''; employee.contractId ||= employee.assignedContractIds?.[0] || ''; employee.salaryPeriod ||= 'BIWEEKLY'; employee.salaryDaily ||= employee.salary ? employee.salary / (employee.salaryPeriod === 'WEEKLY' ? 7 : 15) : 0; employee.birthDate ||= ageFromCurp(employee.curp); employee.age ||= ageFromBirthDate(employee.birthDate); const seniority = seniorityData(employee.hireDate); employee.seniorityYears ||= seniority.years; employee.integrationFactor ||= seniority.factor; employee.integratedDailySalary ||= employee.salaryDaily * employee.integrationFactor; });
  state.db.employees.forEach(employee => { employee.workLocation ||= 'CENTRAL_OFFICE'; });
  state.db.contracts.forEach(recalculateContract);
  state.db.projects.forEach(project => (project.estimates || []).forEach(estimate => {
    const contract = byId(state.db.contracts, estimate.contractId || project.contractId);
    if (!estimate.ivaType || estimate.ivaType === 'EXEMPT' || !estimate.ivaAmount) {
      estimate.ivaType = contract?.ivaType || 'RATE_16';
    }
    estimate.subtotal2 = Number(estimate.subtotal || estimate.amount || 0) - Number(estimate.amortization || 0) - Number(estimate.retentionAmount || 0);
    estimate.ivaRate = ivaOptions.find(option => option.value === estimate.ivaType)?.rate ?? 0.16;
    estimate.ivaAmount = Number(estimate.subtotal2 || 0) * estimate.ivaRate;
    estimate.total = Number(estimate.subtotal2 || 0) + estimate.ivaAmount;
    estimate.netAmount = estimate.total;
  }));
  state.db.invoiceRequests.forEach(request => {
    const estimate = state.db.projects.flatMap(project => project.estimates || []).find(item => item.id === request.estimateId);
    if (!estimate) return;
    request.subtotal2 = estimate.subtotal2;
    request.ivaAmount = estimate.ivaAmount;
    request.total = estimate.total;
    request.amount = estimate.total;
  });
  persistLocalData();
  state.db.measurementUnits ||= [...unitOptions];
  const savedActiveUserId = localStorage.getItem('rinosoft.activeUserId');
  const savedView = localStorage.getItem('rinosoft.activeView');
  state.activeUserId = state.db.users.some(user => user.id === savedActiveUserId) ? savedActiveUserId : state.activeUserId;
  state.view = savedView && labels[savedView] ? savedView : defaultView();
  state.workspaceOpen = localStorage.getItem('rinosoft.workspaceOpen') === 'true';
  if (state.workspaceOpen) {
    document.querySelector('#public-home').hidden = true;
    document.querySelector('#app').hidden = false;
  }
  populateUserSelect();
  bindBackupActions();
  render();
}
function findActiveEmployeeByWorkerId(workerId) {
  const value = String(workerId || '').trim();
  if (!value) return null;
  const normalized = value.toUpperCase();
  return state.db.employees.find(employee => employee.status === 'ACTIVE' && [employee.workerId, employee.employeeNumber, employee.id].some(field => String(field || '').toUpperCase() === normalized));
}
function applyWorkerFilterToRow(row) {
  const employeeSelect = row.querySelector('[name="employeeId"]');
  const workerInput = row.querySelector('[name="workerId"]');
  if (!workerInput || !employeeSelect || employeeSelect.type === 'hidden') return;
  const syncEmployee = () => {
    const typed = String(workerInput.value || '').trim();
    const match = findActiveEmployeeByWorkerId(typed);
    if (match) {
      employeeSelect.value = match.id;
      workerInput.value = match.workerId || match.employeeNumber || match.id;
    }
  };
  const updateOptions = () => {
    const filterValue = String(workerInput.value || '').trim().toUpperCase();
    let firstVisible = null;
    [...employeeSelect.options].forEach(option => {
      if (!option.value) {
        option.hidden = false;
        option.disabled = false;
        return;
      }
      const candidateId = String(option.dataset.workerId || '').trim().toUpperCase();
      const matches = !filterValue || candidateId.includes(filterValue) || option.value.toUpperCase().includes(filterValue);
      option.hidden = !matches;
      option.disabled = !matches;
      if (matches && !firstVisible) firstVisible = option.value;
    });
    if (firstVisible) employeeSelect.value = firstVisible;
  };
  employeeSelect.addEventListener('change', () => {
    const employee = byId(state.db.employees, employeeSelect.value);
    if (employee) workerInput.value = employee.workerId || employee.employeeNumber || employee.id;
    updateOptions();
  });
  workerInput.addEventListener('input', () => {
    syncEmployee();
    updateOptions();
  });
  syncEmployee();
  updateOptions();
}
function activeEmployeeContext() {
  if (state.publicEmployeeId) return byId(state.db.employees, state.publicEmployeeId) || findActiveEmployeeByWorkerId(state.publicWorkerId || '');
  return null;
}
function bindPublicHome() {
  const home = document.querySelector('#public-home');
  const app = document.querySelector('#app');
  const workerInput = document.querySelector('#public-worker-id');
  const workerStatus = document.querySelector('#public-worker-status');
  const loginDialog = document.querySelector('#platform-login');
  const loginForm = document.querySelector('#platform-login-form');
  const loginStatus = document.querySelector('#platform-login-status');
  const closeLogin = () => {
    if (loginDialog) loginDialog.hidden = true;
    if (loginForm) loginForm.reset();
    if (loginStatus) loginStatus.textContent = '';
  };
  const updateStatus = employee => {
    if (!workerStatus) return;
    if (!employee) {
      workerStatus.textContent = 'Ingresa tu ID para validar que eres un colaborador activo.';
      workerStatus.style.color = 'var(--muted)';
      return;
    }
    workerStatus.textContent = `Colaborador activo verificado: ${employee.name} (${employee.workerId || employee.employeeNumber}).`;
    workerStatus.style.color = '#0d6d5d';
  };
  const validateWorker = () => {
    const value = String(workerInput?.value || '').trim();
    const employee = findActiveEmployeeByWorkerId(value);
    if (!value) {
      updateStatus(null);
      return null;
    }
    if (!employee) {
      workerStatus.textContent = `No encontramos un colaborador activo con el ID "${value}". Puedes corregirlo e intentarlo nuevamente.`;
      workerStatus.style.color = '#8a3d3d';
      return null;
    }
    updateStatus(employee);
    return employee;
  };
  const enter = (view, preservePublicSession = false) => {
    if (!preservePublicSession) {
      state.publicEmployeeId = null;
      state.publicWorkerId = null;
      state.workspaceOpen = true;
      localStorage.setItem('rinosoft.workspaceOpen', 'true');
    }
    home.hidden = true;
    app.hidden = false;
    state.view = view;
    render();
  };
  const exit = () => {
    state.publicEmployeeId = null;
    state.publicWorkerId = null;
    app.hidden = true;
    home.hidden = false;
    state.view = 'dashboard';
    state.workspaceOpen = false;
    localStorage.removeItem('rinosoft.workspaceOpen');
    localStorage.removeItem('rinosoft.activeView');
    if (workerInput) workerInput.value = '';
    updateStatus(null);
  };
  ['#public-workspace', '#public-workspace-hero', '#public-workspace-card'].forEach(selector => document.querySelector(selector)?.addEventListener('click', () => enter('dashboard')));
  document.querySelector('#platform-login-close')?.addEventListener('click', closeLogin);
  loginDialog?.addEventListener('click', event => { if (event.target === loginDialog) closeLogin(); });
  loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const loginId = String(form.get('loginId') || '').trim().toUpperCase();
    const password = String(form.get('password') || '');
    const user = state.db?.users.find(candidate => candidate.active && [candidate.workerId, candidate.employeeNumber, candidate.id].some(value => String(value || '').toUpperCase() === loginId) && candidate.password === password);
    if (!user) {
      if (loginStatus) loginStatus.textContent = 'ID o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
      return;
    }
    state.activeUserId = user.id;
    closeLogin();
    enter('dashboard');
  });
  workerInput?.addEventListener('input', () => {
    const value = String(workerInput.value || '').trim();
    if (!value) {
      updateStatus(null);
      return;
    }
    validateWorker();
  });
  document.querySelector('#public-worker-login')?.addEventListener('click', () => {
    if (!loginDialog) return;
    loginDialog.hidden = false;
    const loginIdField = loginForm?.querySelector('[name="loginId"]');
    const passwordField = loginForm?.querySelector('[name="password"]');
    const confirmedWorkerId = String(workerInput?.value || '').trim();
    if (loginIdField && confirmedWorkerId) {
      loginIdField.value = confirmedWorkerId;
      passwordField?.focus();
    } else {
      loginIdField?.focus();
    }
  });
  document.querySelector('#public-worker-reimbursement')?.addEventListener('click', () => {
    const employee = validateWorker();
    if (!employee) {
      window.alert('Solo pueden solicitar reembolso los trabajadores activos con su ID correcto.');
      return;
    }
    state.publicEmployeeId = employee.id;
    state.publicWorkerId = employee.workerId || employee.employeeNumber || employee.id;
    home.hidden = true; app.hidden = false; state.view = 'reimbursements'; render();
    setTimeout(() => {
      const form = document.querySelector('#new-reimbursement-form');
      if (!form) return;
      const firstRow = form.querySelector('[data-reimbursement-row]');
      if (!firstRow) return;
      const workerField = firstRow.querySelector('[name="workerId"]');
      const employeeField = firstRow.querySelector('[name="employeeId"]');
      if (workerField) workerField.value = employee.workerId || employee.employeeNumber || employee.id;
      if (employeeField) employeeField.value = employee.id;
      applyWorkerFilterToRow(firstRow);
    }, 0);
  });
  document.querySelector('#public-reimbursement')?.addEventListener('click', () => {
    const employee = validateWorker();
    if (!employee) {
      window.alert('Primero escribe un ID de trabajador activo para poder solicitar un reembolso.');
      return;
    }
    state.publicEmployeeId = employee.id;
    state.publicWorkerId = employee.workerId || employee.employeeNumber || employee.id;
    home.hidden = true; app.hidden = false; state.view = 'reimbursements'; render();
    setTimeout(() => {
      const form = document.querySelector('#new-reimbursement-form');
      if (!form) return;
      const row = form.querySelector('[data-reimbursement-row]');
      if (!row) return;
      const workerField = row.querySelector('[name="workerId"]');
      const employeeField = row.querySelector('[name="employeeId"]');
      if (workerField) workerField.value = employee.workerId || employee.employeeNumber || employee.id;
      if (employeeField) employeeField.value = employee.id;
      applyWorkerFilterToRow(row);
    }, 0);
  });
  document.querySelector('#public-reimbursement-footer')?.addEventListener('click', () => {
    const employee = validateWorker();
    if (!employee) {
      window.alert('Primero escribe un ID de trabajador activo para poder solicitar un reembolso.');
      return;
    }
    state.publicEmployeeId = employee.id;
    state.publicWorkerId = employee.workerId || employee.employeeNumber || employee.id;
    home.hidden = true; app.hidden = false; state.view = 'reimbursements'; render();
    setTimeout(() => {
      const form = document.querySelector('#new-reimbursement-form');
      if (!form) return;
      const row = form.querySelector('[data-reimbursement-row]');
      if (!row) return;
      const workerField = row.querySelector('[name="workerId"]');
      const employeeField = row.querySelector('[name="employeeId"]');
      if (workerField) workerField.value = employee.workerId || employee.employeeNumber || employee.id;
      if (employeeField) employeeField.value = employee.id;
      applyWorkerFilterToRow(row);
    }, 0);
  });
  document.querySelector('#public-exit')?.addEventListener('click', exit);
  document.querySelector('#sidebar-exit')?.addEventListener('click', exit);
}

function activeUser() {
  if (state.publicEmployeeId) {
    const employee = byId(state.db.employees, state.publicEmployeeId) || findActiveEmployeeByWorkerId(state.publicWorkerId || '');
    if (employee) return { id: employee.id, name: employee.name, roleId: 'ROL-WORKER', active: true };
  }
  return byId(state.db.users, state.activeUserId);
}
function activeRole() {
  if (state.publicEmployeeId) return { id: 'ROL-WORKER', name: 'TRABAJADOR', label: 'Colaborador', permissions: ['reimbursements.read', 'reimbursements.create'] };
  return byId(state.db.roles, activeUser().roleId);
}
function can(permission) { return activeRole().permissions.includes('*') || activeRole().permissions.includes(permission) || activeRole().permissions.includes(`${permission}.*`); }
function canViewDashboard() { return !['RECURSOS_HUMANOS', 'COMPRAS', 'ALMACEN', 'OPERACIONES_PROYECTOS'].includes(activeRole().name); }
function defaultView() { return canViewDashboard() ? 'dashboard' : ({ RECURSOS_HUMANOS: 'people', COMPRAS: 'purchases', ALMACEN: 'warehouse', OPERACIONES_PROYECTOS: 'projects' }[activeRole().name] || 'dashboard'); }

function populateUserSelect() {
  const select = document.querySelector('#user-select');
  if (!select) return;
  const userPickerLabel = select.closest('.user-picker');
  if (state.publicEmployeeId && activeEmployeeContext()) {
    const emp = activeEmployeeContext();
    select.innerHTML = `<option value="${emp.id}">${emp.name} · Colaborador (${emp.workerId || emp.employeeNumber || emp.id})</option>`;
    select.value = emp.id;
    select.disabled = true;
    return;
  }
  select.disabled = false;
  select.innerHTML = state.db.users.map(user => `<option value="${user.id}">${user.name} · ${byId(state.db.roles, user.roleId).label}</option>`).join('');
  select.value = state.activeUserId;
  if (!select.dataset.bound) {
    select.dataset.bound = 'true';
    select.addEventListener('change', event => {
      state.publicEmployeeId = null;
      state.publicWorkerId = null;
      state.activeUserId = event.target.value;
      state.view = defaultView();
      state.workspaceOpen = true;
      localStorage.setItem('rinosoft.workspaceOpen', 'true');
      render();
    });
  }
}
function persistLocalData() {
  localStorage.setItem('rinosoft.contracts', JSON.stringify(state.db.contracts));
  localStorage.setItem('rinosoft.changeOrders', JSON.stringify(state.db.changeOrders));
  localStorage.setItem('rinosoft.pendingActions', JSON.stringify(state.db.pendingActions));
  localStorage.setItem('rinosoft.approvalHistory', JSON.stringify(state.db.approvalHistory));
  localStorage.setItem('rinosoft.clients', JSON.stringify(state.db.clients));
    localStorage.setItem('rinosoft.projects', JSON.stringify(state.db.projects));
    localStorage.setItem('rinosoft.invoices', JSON.stringify(state.db.invoices));
    localStorage.setItem('rinosoft.payments', JSON.stringify(state.db.payments));
    localStorage.setItem('rinosoft.purchaseOrders', JSON.stringify(state.db.purchaseOrders));
    localStorage.setItem('rinosoft.inventory', JSON.stringify(state.db.inventory));
    localStorage.setItem('rinosoft.inventoryMovements', JSON.stringify(state.db.inventoryMovements));
    localStorage.setItem('rinosoft.reimbursements', JSON.stringify(state.db.reimbursements));
    localStorage.setItem('rinosoft.incidents', JSON.stringify(state.db.incidents));
    localStorage.setItem('rinosoft.vacationRequests', JSON.stringify(state.db.vacationRequests));
    localStorage.setItem('rinosoft.employeeDocuments', JSON.stringify(state.db.employeeDocuments));
    localStorage.setItem('rinosoft.terminations', JSON.stringify(state.db.terminations));
    localStorage.setItem('rinosoft.positionCatalog', JSON.stringify(state.db.positionCatalog));
    localStorage.setItem('rinosoft.payroll', JSON.stringify(state.db.payroll));
    localStorage.setItem('rinosoft.invoiceRequests', JSON.stringify(state.db.invoiceRequests));
    localStorage.setItem('rinosoft.measurementUnits', JSON.stringify(state.db.measurementUnits));
}
function bindBackupActions() {
  document.querySelector('#export-backup').addEventListener('click', () => {
    persistLocalData();
    const backup = { app: 'Rinosoft ERP', version: '0.1.0', exportedAt: new Date().toISOString(), data: state.db };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rinosoft-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  const fileInput = document.querySelector('#backup-file');
  document.querySelector('#import-backup').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!backup.data?.contracts || !backup.data?.users || !backup.data?.roles) throw new Error('El archivo no contiene una estructura Rinosoft válida.');
      if (!window.confirm('Importar este respaldo reemplazará los datos locales actuales. ¿Deseas continuar?')) return;
      state.db = backup.data;
      state.db.approvalHistory ||= [];
      persistLocalData();
      state.selectedContractId = null;
      populateUserSelect();
      render();
      window.alert('Respaldo importado correctamente.');
      showToast('Respaldo importado correctamente.', 'success');
    } catch (error) {
      showToast(`No se pudo importar el respaldo: ${error.message}`, 'error');
    } finally {
      fileInput.value = '';
    }
  });
}

function render() {
  if (state.view === 'dashboard' && !canViewDashboard()) state.view = defaultView();
  if (state.view === 'finance') state.view = 'billing';
  if (state.workspaceOpen && !state.publicEmployeeId) {
    localStorage.setItem('rinosoft.activeView', state.view);
    localStorage.setItem('rinosoft.activeUserId', state.activeUserId);
  }
  document.querySelector('#page-title').textContent = labels[state.view];
  document.querySelector('#user-avatar').textContent = initials(activeUser().name);
  populateUserSelect();
  renderNav();
  document.querySelector('#content').innerHTML = views[state.view]();
  bindPendingActions();
  bindContractLinks();
  bindEmployeeLinks();
  bindHomeReimbursements();
  bindEmployeeHistorySuggestions();
  bindPositionLinks();
  bindContractForms();
  bindClientProjectForms();
  bindFinanceForms();
  bindInventoryForms();
  bindWarehouseTabs();
  bindCatalogTabs();
  bindProjectTabs();
  bindReimbursementForms();
  bindEmployeeForms();
  bindApprovalActions();
  bindEstimateActions();
  bindFormattedInputs();
  bindTableSearches();
  bindWarehouseKardex();
}

function renderNav() {
  const role = activeRole();
  const isWorkerOnlySession = Boolean(state.publicEmployeeId && activeEmployeeContext());
  const items = isWorkerOnlySession ? [
    ['dashboard', 'Resumen', true],
    ['reimbursements', 'Reembolsos', true]
  ] : [
    ['dashboard', 'Resumen', canViewDashboard()],
    ['clients', 'Clientes', can('clients.read') || can('clients.*')],
    ['contracts', 'Contratos', can('contracts.read')],
    ['projects', 'Proyectos', can('projects.read') || can('projects.*')],
    ['billing', 'Facturación', can('invoices.*')],
    ['collections', 'Cobranza', can('payments.*')],
    ['reimbursements', 'Reembolsos', ['FINANZAS', 'DIRECCION_GENERAL'].includes(activeRole().name)],
    ['purchases', 'Compras', can('purchaseOrders.*')],
    ['masterCatalog', 'Catálogo maestro', ['COMPRAS', 'DIRECCION_GENERAL'].includes(role.name) || can('masterCatalog.*')],
    ['warehouse', 'Almacen', can('inventory.read') || can('inventory.*')],
    ['people', 'Altas y expedientes', can('employees.read') || can('employees.*')],
    ['hrChanges', 'Bajas y modificaciones', can('employees.*')],
    ['hrPositions', 'Catálogo de puestos', can('employees.read') || can('employees.*')],
    ['hrIncidents', 'Incidencias', can('employees.*')],
    ['hrVacations', 'Vacaciones', can('employees.*')]
  ];
  document.querySelector('#main-nav').innerHTML = items.filter(item => item[2]).map(([id, label]) => `<button class="nav-button ${state.view === id ? 'active' : ''}" data-view="${id}">${label}</button>`).join('');
  document.querySelectorAll('.nav-button').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; render(); }));
}

function metric(label, value, note) { return `<article class="metric"><span class="metric-label">${label}</span><strong class="metric-value">${value}</strong><div class="metric-note">${note}</div></article>`; }
function badge(status) { const warm = ['PARTIALLY_PAID', 'PENDING', 'PARTIALLY_RECEIVED'].includes(status); const gray = ['PLANNED', 'SENT'].includes(status); return `<span class="badge ${warm ? 'warm' : gray ? 'gray' : ''}">${statusLabel(status)}</span>`; }
function departmentLabel(name) { return state.db.roles.find(role => role.name === name)?.label || name; }
function bindPendingActions() {
  document.querySelectorAll('[data-action-id]').forEach(button => button.addEventListener('click', () => {
    const action = byId(state.db.pendingActions, button.dataset.actionId);
    if (activeRole().name !== 'DIRECCION_GENERAL' && action.department !== activeRole().name) {
      window.alert(`Advertencia: este pendiente corresponde al departamento ${departmentLabel(action.department)}. Tu departamento no puede gestionarlo.`);
      return;
    }
    action.status = button.dataset.actionStatus;
    action.resolvedBy = activeUser().id;
    action.resolvedAt = new Date().toISOString();
    localStorage.setItem('rinosoft.pendingActions', JSON.stringify(state.db.pendingActions));
    render();
  }));
}
function bindContractLinks() {
  document.querySelectorAll('[data-contract-id]').forEach(link => link.addEventListener('click', () => {
    state.selectedContractId = link.dataset.contractId;
    render();
  }));
  document.querySelectorAll('[data-clear-contract]').forEach(button => button.addEventListener('click', () => {
    state.selectedContractId = null;
    state.editingContractId = null;
    render();
  }));
  document.querySelectorAll('[data-edit-contract]').forEach(button => button.addEventListener('click', () => {
    state.selectedContractId = button.dataset.editContract;
    state.editingContractId = button.dataset.editContract;
    render();
  }));
}
function bindEmployeeLinks() {
  document.querySelectorAll('[data-employee-id]').forEach(link => link.addEventListener('click', () => { state.selectedEmployeeId = link.dataset.employeeId; render(); }));
  document.querySelectorAll('strong.employee-link[data-employee-id]').forEach(link => { const button = document.createElement('button'); button.type = 'button'; button.className = 'action-button complete employee-edit-button'; button.textContent = 'Modificar'; button.dataset.editEmployee = link.dataset.employeeId; button.addEventListener('click', event => { event.stopPropagation(); state.selectedEmployeeId = button.dataset.editEmployee; state.editingEmployeeId = button.dataset.editEmployee; render(); }); link.parentElement.appendChild(button); });
  document.querySelectorAll('[data-clear-employee]').forEach(button => button.addEventListener('click', () => { state.selectedEmployeeId = null; render(); }));
  document.querySelectorAll('[data-edit-employee]').forEach(button => button.addEventListener('click', () => { state.selectedEmployeeId = button.dataset.editEmployee; state.editingEmployeeId = button.dataset.editEmployee; render(); }));
}
function bindHomeReimbursements() {
  document.querySelectorAll('[data-open-reimbursements]').forEach(button => button.addEventListener('click', () => { state.view = 'reimbursements'; render(); }));
  document.querySelectorAll('[data-home-reimbursements]').forEach(button => button.addEventListener('click', () => { state.view = 'dashboard'; render(); }));
}
function bindEmployeeHistorySuggestions() {
  ['name', 'nss', 'curp'].forEach(fieldName => {
    const inputs = document.querySelectorAll(`[name="${fieldName}"]`);
    inputs.forEach(input => {
      input.removeAttribute('list');
      input.setAttribute('autocomplete', 'off');
      const wrapper = input.parentElement;
      wrapper.classList.add('history-field');
      const menu = document.createElement('div');
      menu.className = 'history-suggestions';
      wrapper.appendChild(menu);
      const values = [...new Set(state.db.employees.map(employee => employee[fieldName]).filter(Boolean))];
      const closeMenu = () => { menu.innerHTML = ''; menu.classList.remove('visible'); };
      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const matches = values.filter(value => value.toLowerCase().includes(query)).slice(0, 8);
        if (!query || !matches.length) { closeMenu(); return; }
        menu.innerHTML = matches.map(value => `<button type="button" class="history-suggestion">${value}</button>`).join('');
        menu.classList.add('visible');
        menu.querySelectorAll('.history-suggestion').forEach(button => button.addEventListener('mousedown', event => { event.preventDefault(); input.value = button.textContent; closeMenu(); input.dispatchEvent(new Event('change', { bubbles: true })); fillEmployeeHistory(button.textContent); }));
      });
      input.addEventListener('blur', () => setTimeout(closeMenu, 150));
    });
  });
}
function fillEmployeeHistory(value) {
  const employee = state.db.employees.find(item => [item.name, item.nss, item.curp].includes(value));
  if (!employee) return;
  const form = document.querySelector('#new-employee-form, #edit-employee-form');
  if (!form) return;
  const values = { workerId: employee.workerId || employee.employeeNumber, name: employee.name, nss: employee.nss, curp: employee.curp, rfc: employee.rfc, postalCode: employee.postalCode, birthDate: employee.birthDate, birthPlace: employee.birthPlace, nationality: employee.nationality, phone: employee.phone, emergencyPhone: employee.emergencyPhone, emergencyContact: employee.emergencyContact, emergencyRelationship: employee.emergencyRelationship, bank: employee.bank, account: employee.account, clabe: employee.clabe, card: employee.card, salary: employee.salary, department: employee.department, workLocation: employee.workLocation, projectId: employee.projectId, contractId: employee.contractId, positionKey: employee.positionKey, salaryPeriod: employee.salaryPeriod, status: employee.status };
  Object.entries(values).forEach(([name, fieldValue]) => { const field = form.querySelector(`[name="${name}"]`); if (field && fieldValue !== undefined && fieldValue !== null) { field.value = fieldValue; field.dispatchEvent(new Event('change', { bubbles: true })); } });
  const age = form.querySelector('[name="age"]'); if (age) age.value = employee.age || ageFromBirthDate(employee.birthDate);
  const description = form.querySelector('[name="positionDescription"]'); if (description) description.value = employee.positionDescription || positionDescription(employee.positionKey);
}
function bindPositionLinks() {
  document.querySelectorAll('[data-position-key]').forEach(link => link.addEventListener('click', () => { state.selectedPositionKey = link.dataset.positionKey; render(); }));
  document.querySelectorAll('[data-clear-position]').forEach(button => button.addEventListener('click', () => { state.selectedPositionKey = null; render(); }));
  const form = document.querySelector('#edit-position-form');
  if (form) form.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(form); const position = state.db.positionCatalog.find(item => item.value === data.get('value')); Object.assign(position, { label: data.get('label'), department: data.get('department'), description: data.get('description') }); localStorage.setItem('rinosoft.positionCatalog', JSON.stringify(state.db.positionCatalog)); state.selectedPositionKey = null; render(); });
  const employeeForm = document.querySelector('#edit-employee-form');
  if (employeeForm) employeeForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(employeeForm); const clabe = String(data.get('clabe') || '').trim(); const card = String(data.get('card') || '').trim(); if (!/^\d{18}$/.test(clabe) || !/^\d{16}$/.test(card)) { window.alert('La CLABE interbancaria debe tener 18 dígitos y la tarjeta debe tener 16 dígitos.'); return; } const employee = byId(state.db.employees, data.get('employeeId')); Object.assign(employee, { name: data.get('name'), projectId: data.get('projectId'), contractId: data.get('contractId'), department: data.get('department'), workLocation: data.get('workLocation'), positionKey: data.get('positionKey'), position: positionLabel(data.get('positionKey')), positionDescription: positionDescription(data.get('positionKey')), salary: numericValue(data.get('salary')), salaryPeriod: data.get('salaryPeriod'), phone: data.get('phone'), emergencyPhone: data.get('emergencyPhone'), emergencyContact: data.get('emergencyContact'), bank: data.get('bank'), account: data.get('account'), clabe, card, status: data.get('status') }); employee.salaryDaily = employee.salary / (employee.salaryPeriod === 'WEEKLY' ? 7 : 15); employee.integratedDailySalary = employee.salaryDaily * (employee.integrationFactor || 1); if (employee.status === 'ACTIVE') employee.terminationDate = null; persistLocalData(); state.editingEmployeeId = null; render(); });
}
function persistCollection(key, collection) { localStorage.setItem(`rinosoft.${key}`, JSON.stringify(collection)); }
function bindContractForms() {
  const contractForm = document.querySelector('#new-contract-form');
  if (contractForm) contractForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(contractForm);
    const id = `CT-2026-${String(state.db.contracts.length + 1).padStart(3, '0')}`;
    const amount = numericValue(form.get('amount'));
    const ivaType = form.get('ivaType');
    const retentionRates = readRetentions(contractForm);
    const advanceMode = form.get('advanceMode');
    const advanceValue = numericValue(form.get('advanceValue')) / (advanceMode === 'PERCENTAGE' ? 100 : 1);
    const amounts = fiscalAmounts(amount, ivaType, advanceMode, advanceValue, retentionRates);
    const attachments = await readFiles(contractForm.querySelector('[name="attachments"]').files);
    state.db.contracts.push({ id, contractNumber: form.get('contractNumber'), contractName: form.get('contractName'), quoteId: null, clientId: form.get('clientId'), projectId: null, date: form.get('date'), startDate: form.get('date'), endDate: form.get('endDate'), status: 'DRAFT', approvalStatus: 'DRAFT', originalAmount: amount, originalSubtotal: amount, ivaType, ivaRate: amounts.ivaRate, originalIvaAmount: amounts.ivaAmount, advanceMode, advanceValue, advanceAmount: amounts.advanceAmount, advancePercentage: amount ? amounts.advanceAmount / amount : 0, retentionRates, retentionAmount: amounts.retentionAmount, netAmount: amounts.netAmount, changeOrderAmount: 0, updatedAmount: amount, billedAmount: 0, collectedAmount: 0, pendingAmount: amount, attachments, currency: 'MXN' });
    persistCollection('contracts', state.db.contracts);
    state.selectedContractId = null;
    render();
  });
  const changeForm = document.querySelector('#change-order-form');
  if (changeForm) changeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(changeForm);
    const contract = byId(state.db.contracts, form.get('contractId'));
    const amount = numericValue(form.get('amount'));
    const ivaType = form.get('ivaType');
    const retentionRates = readRetentions(changeForm);
    const advanceMode = form.get('advanceMode');
    const advanceValue = numericValue(form.get('advanceValue')) / (advanceMode === 'PERCENTAGE' ? 100 : 1);
    const amounts = fiscalAmounts(amount, ivaType, advanceMode, advanceValue, retentionRates);
    const id = `OC-2026-${String(state.db.changeOrders.length + 1).padStart(3, '0')}`;
    const attachments = await readFiles(changeForm.querySelector('[name="attachments"]').files);
    state.db.changeOrders.push({ id, contractId: contract.id, date: form.get('date'), startDate: form.get('date'), endDate: form.get('endDate'), description: form.get('description'), amount, subtotal: amount, ivaType, ivaRate: amounts.ivaRate, ivaAmount: amounts.ivaAmount, advanceMode, advanceValue, advanceAmount: amounts.advanceAmount, retentionRates, retentionAmount: amounts.retentionAmount, netAmount: amounts.netAmount, attachments, status: 'PENDING', approvalStatus: 'IN_REVIEW', appliedToContract: false });
    persistCollection('changeOrders', state.db.changeOrders);
    persistCollection('contracts', state.db.contracts);
    state.selectedContractId = contract.id;
    render();
  });
  const editForm = document.querySelector('#edit-contract-form');
  if (editForm) editForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(editForm);
    const contract = byId(state.db.contracts, form.get('contractId'));
    if (!contract || !['DRAFT', 'IN_REVIEW'].includes(contract.approvalStatus)) return;
    const amount = numericValue(form.get('amount'));
    const ivaType = form.get('ivaType');
    const retentionRates = readRetentions(editForm);
    const advanceMode = form.get('advanceMode');
    const advanceValue = numericValue(form.get('advanceValue')) / (advanceMode === 'PERCENTAGE' ? 100 : 1);
    const amounts = fiscalAmounts(amount, ivaType, advanceMode, advanceValue, retentionRates);
    Object.assign(contract, { contractNumber: form.get('contractNumber'), contractName: form.get('contractName'), clientId: form.get('clientId'), endDate: form.get('endDate'), originalAmount: amount, originalSubtotal: amount, ivaType, ivaRate: amounts.ivaRate, originalIvaAmount: amounts.ivaAmount, advanceMode, advanceValue, advanceAmount: amounts.advanceAmount, advancePercentage: amount ? amounts.advanceAmount / amount : 0, retentionRates, retentionAmount: amounts.retentionAmount, netAmount: amounts.netAmount, updatedAmount: amount + contract.changeOrderAmount, pendingAmount: amount + contract.changeOrderAmount - contract.billedAmount });
    state.db.approvalHistory.push({ id: `APR-${Date.now()}`, type: 'CONTRACT', recordId: contract.id, status: 'EDITED', userId: activeUser().id, date: new Date().toISOString(), reason: 'Contrato editado antes de autorización' });
    persistCollection('contracts', state.db.contracts);
    persistCollection('approvalHistory', state.db.approvalHistory);
    state.editingContractId = null;
    render();
  });
  document.querySelectorAll('[data-add-retention]').forEach(button => button.addEventListener('click', () => {
    const container = document.querySelector(`#${button.dataset.addRetention}`);
    const row = document.createElement('div');
    row.className = 'retention-row';
    row.dataset.retentionRow = 'true';
    row.innerHTML = '<input name="retentionConcept" placeholder="Concepto" required><select name="retentionMode"><option value="PERCENTAGE">%</option><option value="AMOUNT">$</option></select><input name="retentionValue" data-number-format="percentage" inputmode="decimal" placeholder="Valor" required><button type="button" class="remove-retention" aria-label="Eliminar retención">×</button>';
    row.querySelector('[name="retentionMode"]').addEventListener('change', event => { const input = row.querySelector('[name="retentionValue"]'); input.dataset.numberFormat = event.target.value === 'AMOUNT' ? 'currency' : 'percentage'; input.value = formatInputValue(input.value, input.dataset.numberFormat); });
    row.querySelector('[name="retentionValue"]').addEventListener('input', event => { event.target.value = formatInputValue(event.target.value, event.target.dataset.numberFormat); });
    row.querySelector('.remove-retention').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }));
}
function bindFormattedInputs() {
  document.querySelectorAll('input[data-number-format]').forEach(input => {
    input.value = formatInputValue(input.value, input.dataset.numberFormat);
    input.addEventListener('input', event => { event.target.value = formatInputValue(event.target.value, event.target.dataset.numberFormat); });
  });
  document.querySelectorAll('[name="advanceMode"]').forEach(select => select.addEventListener('change', event => {
    const input = event.target.closest('.advance-fields').querySelector('[name="advanceValue"]');
    input.dataset.numberFormat = event.target.value === 'AMOUNT' ? 'currency' : 'percentage';
    input.value = formatInputValue(input.value, input.dataset.numberFormat);
  }));
  document.querySelectorAll('.retention-row [name="retentionMode"]').forEach(select => select.addEventListener('change', event => {
    const input = event.target.closest('.retention-row').querySelector('[name="retentionValue"]');
    input.dataset.numberFormat = event.target.value === 'AMOUNT' ? 'currency' : 'percentage';
    input.value = formatInputValue(input.value, input.dataset.numberFormat);
  }));
  document.querySelectorAll('.retention-row .remove-retention').forEach(button => button.addEventListener('click', () => button.closest('.retention-row').remove()));
}
function bindEmployeeForms() {
  const form = document.querySelector('#new-employee-form');
  if (form) {
  const curp = form.querySelector('[name="curp"]');
  const birthDate = form.querySelector('[name="birthDate"]');
  curp.addEventListener('input', () => { const extracted = ageFromCurp(curp.value); if (extracted) birthDate.value = extracted; form.querySelector('[name="age"]').value = ageFromBirthDate(birthDate.value); });
  birthDate.addEventListener('change', () => { form.querySelector('[name="age"]').value = ageFromBirthDate(birthDate.value); });
    const department = form.querySelector('[name="department"]');
    const workerId = form.querySelector('[name="workerId"]');
    if (department?.tagName === 'INPUT') {
      const select = document.createElement('select');
      select.name = 'department';
      select.required = true;
      select.innerHTML = departmentOptions.map(option => `<option value="${option.value}">${option.value} · ${option.label}</option>`).join('');
      department.replaceWith(select);
    }
    const departmentSelector = form.querySelector('[name="department"]');
    const positionSelect = form.querySelector('[name="positionKey"]');
    const updatePositions = () => { const positions = departmentPosition(departmentSelector.value); positionSelect.innerHTML = positions.map(position => `<option value="${position.value}">${position.label}</option>`).join(''); form.querySelector('[name="positionDescription"]').value = positions[0]?.description || ''; };
    positionSelect.addEventListener('change', event => { form.querySelector('[name="positionDescription"]').value = allDepartmentPositions.find(position => position.value === event.target.value)?.description || positionDescription(event.target.value); });
    if (!form.querySelector('[name="workLocation"]')) {
      const locationLabel = document.createElement('label');
      locationLabel.textContent = 'Ubicación laboral';
      const locationSelect = document.createElement('select');
      locationSelect.name = 'workLocation';
      locationSelect.required = true;
      locationSelect.innerHTML = workplaceOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
      locationLabel.appendChild(locationSelect);
      departmentSelector.closest('label').after(locationLabel);
    }
    const updateWorkerId = () => { const prefix = departmentSelector.value; const currentNumber = workerId.value.match(/\d+$/)?.[0] || String(state.db.employees.length + 1).padStart(3, '0'); workerId.value = `${prefix}${currentNumber}`; };
    departmentSelector.addEventListener('change', updateWorkerId);
    departmentSelector.addEventListener('change', updatePositions);
    updateWorkerId();
    updatePositions();
  const updateSalaryPreview = () => { const salary = numericValue(form.querySelector('[name="salary"]').value); const days = form.querySelector('[name="salaryPeriod"]').value === 'WEEKLY' ? 7 : 15; const daily = salary / days; const seniority = seniorityData(form.querySelector('[name="hireDate"]').value); form.querySelector('[name="salaryDaily"]').value = money(daily); form.querySelector('[name="integrationFactor"]').value = seniority.factor; form.querySelector('[name="integratedDailySalary"]').value = money(daily * seniority.factor); };
  form.querySelector('[name="salary"]').addEventListener('input', updateSalaryPreview);
  form.querySelector('[name="salaryPeriod"]').addEventListener('change', updateSalaryPreview);
  form.querySelector('[name="hireDate"]').addEventListener('change', updateSalaryPreview);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const nss = String(data.get('nss')).toUpperCase();
    const curpValue = String(data.get('curp')).toUpperCase();
    const rfc = String(data.get('rfc')).toUpperCase();
    const workerId = String(data.get('workerId')).toUpperCase();
    const cp = String(data.get('postalCode'));
    const account = String(data.get('account') || '').trim();
    const clabe = String(data.get('clabe') || '').trim();
    const card = String(data.get('card') || '').trim();
    if (!/^[A-Z]{3}\d+$/.test(workerId) || !/^[A-Z0-9]{11}$/.test(nss) || !/^[A-Z0-9]{18}$/.test(curpValue) || !/^[A-Z0-9]{11}$/.test(rfc) || !/^\d{5}$/.test(cp)) { window.alert('Verifica ID, NSS, CURP, RFC y C.P. con los formatos requeridos.'); return; }
    if (!/^\d+$/.test(account) || !/^\d{18}$/.test(clabe) || !/^\d{16}$/.test(card)) { window.alert('La cuenta debe contener solo dígitos, la CLABE interbancaria debe tener 18 dígitos y la tarjeta debe tener 16 dígitos.'); return; }
    const salary = numericValue(data.get('salary'));
    const salaryPeriod = data.get('salaryPeriod');
    const salaryDaily = salary / (salaryPeriod === 'WEEKLY' ? 7 : 15);
    const seniority = seniorityData(data.get('hireDate'));
    const birth = ageFromCurp(curpValue) || data.get('birthDate');
    state.db.employees.push({ id: `EMP-${String(state.db.employees.length + 1).padStart(3, '0')}`, employeeNumber: workerId, workerId, projectId: data.get('projectId'), contractId: data.get('contractId'), name: data.get('name'), nss, curp: curpValue, rfc, postalCode: cp, birthDate: birth, age: ageFromBirthDate(birth), birthPlace: data.get('birthPlace'), nationality: data.get('nationality'), sex: data.get('sex'), maritalStatus: data.get('maritalStatus'), address: { street: data.get('street'), exteriorNumber: data.get('exteriorNumber'), interiorNumber: data.get('interiorNumber'), neighborhood: data.get('neighborhood'), municipality: data.get('municipality'), state: data.get('state'), postalCode: cp }, bloodType: data.get('bloodType'), phone: data.get('phone'), emergencyPhone: data.get('emergencyPhone'), emergencyContact: data.get('emergencyContact'), emergencyRelationship: data.get('emergencyRelationship'), bank: data.get('bank'), account: data.get('account'), clabe: data.get('clabe'), card: data.get('card'), salary, salaryPeriod, salaryDaily, seniorityYears: seniority.years, aguinaldoDays: 15, vacationDays: seniority.vacation, vacationPremium: 0.25, integrationFactor: seniority.factor, integratedDailySalary: salaryDaily * seniority.factor, positionKey: data.get('positionKey'), position: positionLabel(data.get('positionKey')), positionDescription: positionDescription(data.get('positionKey')), department: data.get('department'), hireDate: data.get('hireDate'), status: 'ACTIVE', assignedContractIds: data.get('contractId') ? [data.get('contractId')] : [] });
    state.db.employees[state.db.employees.length - 1].workLocation = data.get('workLocation');
    persistLocalData();
    render();
  });
  }
  const incidentForm = document.querySelector('#new-incident-form');
  if (incidentForm) incidentForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(incidentForm); state.db.incidents.push({ id: `INC-${Date.now()}`, employeeId: data.get('employeeId'), type: data.get('type'), date: data.get('date'), days: Number(data.get('days') || 0), description: data.get('description'), status: 'RECORDED' }); persistLocalData(); render(); });
  const vacationForm = document.querySelector('#new-vacation-form');
  if (vacationForm) vacationForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(vacationForm); const employee = byId(state.db.employees, data.get('employeeId')); const balance = vacationBalance(employee.id); const days = Number(data.get('days')); if (days <= 0 || days > balance.available) { window.alert(`Los días solicitados superan el saldo disponible: ${balance.available} días.`); return; } state.db.vacationRequests.push({ id: `VAC-${Date.now()}`, employeeId: employee.id, startDate: data.get('startDate'), endDate: data.get('endDate'), days, status: 'PENDING', requestedBy: activeUser().id, requestedAt: new Date().toISOString() }); persistLocalData(); render(); });
  document.querySelectorAll('[data-vacation-id]').forEach(button => button.addEventListener('click', () => { if (!['DIRECCION_GENERAL', 'RECURSOS_HUMANOS'].includes(activeRole().name)) return; const request = byId(state.db.vacationRequests, button.dataset.vacationId); request.status = button.dataset.vacationStatus; request.reviewedBy = activeUser().id; request.reviewedAt = new Date().toISOString(); persistLocalData(); render(); }));
  const documentForm = document.querySelector('#employee-document-form');
  if (documentForm) documentForm.addEventListener('submit', async event => { event.preventDefault(); const data = new FormData(documentForm); const files = await readFiles(documentForm.querySelector('[name="files"]').files); state.db.employeeDocuments.push({ id: `DOC-${Date.now()}`, employeeId: data.get('employeeId'), type: data.get('type'), files, date: new Date().toISOString() }); persistLocalData(); render(); });
  const terminationForm = document.querySelector('#employee-termination-form');
  if (terminationForm) terminationForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(terminationForm); const employee = byId(state.db.employees, data.get('employeeId')); employee.status = 'INACTIVE'; employee.terminationDate = data.get('date'); employee.terminationReason = data.get('reason'); state.db.terminations ||= []; state.db.terminations.push({ id: `BAJ-${Date.now()}`, employeeId: employee.id, date: data.get('date'), reason: data.get('reason') }); persistLocalData(); render(); });
  const payrollForm = document.querySelector('#new-payroll-form');
  if (payrollForm) payrollForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(payrollForm); const period = data.get('period'); const days = period === 'WEEKLY' ? 7 : 15; const records = state.db.employees.filter(employee => employee.status === 'ACTIVE').map(employee => ({ employeeId: employee.id, days, gross: employee.salaryDaily * days, incidents: state.db.incidents.filter(item => item.employeeId === employee.id && item.type === 'FALTA').reduce((sum, item) => sum + Number(item.days || 0), 0), net: employee.salaryDaily * days, status: 'CALCULATED' })); state.db.payroll.push({ id: `NOM-${Date.now()}`, period, startDate: data.get('startDate'), endDate: data.get('endDate'), records, createdBy: activeUser().id }); persistLocalData(); render(); });
}
function bindClientProjectForms() {
  const clientForm = document.querySelector('#new-client-form');
  if (clientForm) clientForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(clientForm);
    const id = `CLI-${String(state.db.clients.length + 1).padStart(3, '0')}`;
    state.db.clients.push({ id, legalName: form.get('legalName'), tradeName: form.get('tradeName'), taxId: form.get('taxId'), contact: form.get('contact'), email: form.get('email'), phone: form.get('phone'), status: 'ACTIVE' });
    persistLocalData();
    render();
  });
  const projectForm = document.querySelector('#new-project-form');
  if (projectForm) projectForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(projectForm);
    const id = `PRY-2026-${String(state.db.projects.length + 1).padStart(3, '0')}`;
    const contract = byId(state.db.contracts, form.get('contractId'));
    state.db.projects.push({ id, contractId: contract.id, name: form.get('name'), managerEmployeeId: form.get('managerEmployeeId'), status: 'PLANNED', progressPercent: 0, budget: numericValue(form.get('budget')), actualCost: 0, nextMilestone: form.get('nextMilestone'), estimates: [] });
    contract.projectId = id;
    persistLocalData();
    render();
  });
  const estimateForm = document.querySelector('#new-estimate-form');
  if (estimateForm) estimateForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(estimateForm);
    const project = byId(state.db.projects, form.get('projectId'));
    const contract = byId(state.db.contracts, project?.contractId);
    const subtotal = numericValue(form.get('subtotal'));
    const amortization = numericValue(form.get('amortization'));
    const ivaType = form.get('ivaType') || contract?.ivaType || 'RATE_16';
    const retentions = readRetentions(estimateForm);
    const retentionAmount = retentionTotal(subtotal, retentions);
    const subtotal2 = subtotal - amortization - retentionAmount;
    const ivaRate = ivaOptions.find(option => option.value === ivaType)?.rate ?? 0.16;
    const ivaAmount = subtotal2 * ivaRate;
    const total = subtotal2 + ivaAmount;
    const estimateId = form.get('estimateId');
    const availableAdvance = contract ? getAvailableContractAdvance(contract.id, estimateId) : 0;
    if (amortization > availableAdvance && availableAdvance >= 0) {
      showToast(`La amortización ($${amortization.toLocaleString('en-US')}) supera el anticipo disponible del contrato ($${availableAdvance.toLocaleString('en-US')}).`, 'error');
      return;
    }
    if (!project || !contract || subtotal <= 0 || amortization < 0 || amortization > subtotal || retentionAmount > subtotal - amortization) {
      showToast('Verifica el proyecto, el subtotal, la amortización y las retenciones.', 'error');
      return;
    }
    project.estimates ||= [];
    const previous = estimateId ? project.estimates.find(item => item.id === estimateId) : null;
    if (previous && !['DRAFT', 'REJECTED'].includes(previous.status)) { showToast('Solo se pueden editar estimaciones en borrador o rechazadas.', 'error'); return; }
    if (previous) contract.billedAmount = Math.max(0, Number(contract.billedAmount || 0) - Number(previous.total || 0));
    const estimate = { id: previous?.id || `EST-${Date.now()}`, projectId: project.id, contractId: contract.id, date: form.get('date'), description: form.get('description'), subtotal, amortization, retentionRates: retentions, retentionAmount, subtotal2, ivaType, ivaRate, ivaAmount, total, amount: subtotal, netAmount: total, status: 'DRAFT', createdBy: previous?.createdBy || activeUser().id };
    if (previous) Object.assign(previous, estimate); else project.estimates.push(estimate);
    project.estimatedAmount = project.estimates.reduce((total, estimate) => total + Number(estimate.total || estimate.amount || 0), 0);
    project.retentionAmount = project.estimates.reduce((total, estimate) => total + estimate.retentionAmount, 0);
    contract.billedAmount = Number(contract.billedAmount || 0) + total;
    recalculateContract(contract);
    state.editingEstimateId = null;
    localStorage.setItem('rinosoft.projectTab', 'estimates');
    persistLocalData();
    showToast(previous ? 'Estimación actualizada correctamente.' : 'Estimación guardada en borrador.', 'success');
    render();
  });
  const projectSelect = estimateForm?.querySelector('[name="projectId"]');
  const ivaSelect = estimateForm?.querySelector('[name="ivaType"]');
  const advanceBadge = estimateForm?.parentElement?.querySelector('.advance-badge');
  const updateAdvanceBadge = () => {
    const project = byId(state.db.projects, projectSelect?.value);
    const contract = byId(state.db.contracts, project?.contractId);
    if (contract?.ivaType && ivaSelect) {
      ivaSelect.value = contract.ivaType;
    }
    if (contract && advanceBadge) {
      const avail = getAvailableContractAdvance(contract.id, state.editingEstimateId);
      advanceBadge.innerHTML = `💳 <strong>Anticipo disponible por amortizar:</strong> ${money(avail)} (Contrato: ${contract.contractNumber || contract.id})`;
    }
  };
  projectSelect?.addEventListener('change', updateAdvanceBadge);
}
function bindApprovalActions() {
  document.querySelectorAll('[data-approval-id]').forEach(button => button.addEventListener('click', () => {
    if (activeRole().name !== 'DIRECCION_GENERAL' && button.dataset.approvalAction !== 'IN_REVIEW') {
      window.alert('Solo Dirección General puede aprobar o rechazar este registro.');
      return;
    }
    const collection = button.dataset.approvalType === 'CONTRACT' ? state.db.contracts : button.dataset.approvalType === 'CHANGE_ORDER' ? state.db.changeOrders : state.db.purchaseOrders;
    const record = byId(collection, button.dataset.approvalId);
    if (!record) return;
    const nextStatus = button.dataset.approvalAction;
    const rejectionReason = nextStatus === 'REJECTED' ? window.prompt('Escribe el motivo del rechazo:') : null;
    if (nextStatus === 'REJECTED' && !rejectionReason?.trim()) return;
    const confirmed = nextStatus !== 'REJECTED' || window.confirm('¿Confirmas el rechazo de este registro?');
    if (!confirmed) return;
    const reason = nextStatus === 'REJECTED' ? rejectionReason.trim() : null;
    record.approvalStatus = nextStatus;
    record.status = nextStatus === 'APPROVED' ? (button.dataset.approvalType === 'CONTRACT' ? 'SIGNED' : 'APPROVED') : nextStatus;
    record.approvalReason = nextStatus === 'REJECTED' ? (reason.trim() || 'Sin motivo especificado') : null;
    record.approvedBy = activeUser().id;
    record.approvedAt = new Date().toISOString();
    if (button.dataset.approvalType === 'CHANGE_ORDER' && nextStatus === 'APPROVED' && !record.appliedToContract) {
      const contract = byId(state.db.contracts, record.contractId);
      recalculateContract(contract);
      persistCollection('contracts', state.db.contracts);
    }
    state.db.approvalHistory.push({ id: `APR-${Date.now()}`, type: button.dataset.approvalType, recordId: record.id, status: nextStatus, userId: activeUser().id, date: record.approvedAt, reason: record.approvalReason });
    persistCollection('approvalHistory', state.db.approvalHistory);
    persistCollection(button.dataset.approvalType === 'CONTRACT' ? 'contracts' : button.dataset.approvalType === 'CHANGE_ORDER' ? 'changeOrders' : 'purchaseOrders', collection);
    render();
  }));
}
function bindEstimateActions() {
  document.querySelectorAll('[data-estimate-action]').forEach(button => button.addEventListener('click', () => {
    const estimateId = button.dataset.estimateId;
    const project = state.db.projects.find(item => item.estimates?.some(estimate => estimate.id === estimateId));
    const estimate = project?.estimates?.find(item => item.id === estimateId);
    if (!estimate) return;
    const action = button.dataset.estimateAction;
    if (action === 'EDIT') { state.editingEstimateId = estimate.id; render(); return; }
    if (action === 'REVIEW') { estimate.status = 'IN_REVIEW'; estimate.submittedAt = new Date().toISOString(); persistLocalData(); render(); return; }
    if (action === 'APPROVE') {
      if (activeRole().name !== 'DIRECCION_GENERAL') return window.alert('Solo Dirección General puede aprobar estimaciones.');
      estimate.status = 'APPROVED'; estimate.approvedBy = activeUser().id; estimate.approvedAt = new Date().toISOString(); persistLocalData(); render(); return;
    }
    if (action === 'REJECT') {
      if (activeRole().name !== 'DIRECCION_GENERAL') return window.alert('Solo Dirección General puede rechazar estimaciones.');
      const reason = window.prompt('Escribe el motivo del rechazo:');
      if (!reason?.trim()) return;
      estimate.status = 'REJECTED'; estimate.rejectionReason = reason.trim(); estimate.rejectedBy = activeUser().id; estimate.rejectedAt = new Date().toISOString(); persistLocalData(); render(); return;
    }
    if (action === 'INVOICE') {
      if (estimate.status !== 'APPROVED') return;
      state.db.invoiceRequests.push({ id: `REQ-FAC-${Date.now()}`, estimateId: estimate.id, projectId: estimate.projectId, contractId: estimate.contractId, subtotal2: estimate.subtotal2 ?? estimate.subtotal ?? estimate.amount, ivaAmount: estimate.ivaAmount || 0, total: estimate.total ?? estimate.netAmount, amount: estimate.total ?? estimate.netAmount, status: 'PENDING', requestedBy: activeUser().id, requestedAt: new Date().toISOString() });
      estimate.status = 'INVOICE_REQUESTED';
      persistLocalData(); render();
    }
  }));
  document.querySelectorAll('[data-clear-estimate-edit]').forEach(button => button.addEventListener('click', () => { state.editingEstimateId = null; render(); }));
}
function bindFinanceForms() {
  const invoiceForm = document.querySelector('#new-invoice-form');
  if (invoiceForm) invoiceForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(invoiceForm);
    const contract = byId(state.db.contracts, form.get('contractId'));
    const subtotal = numericValue(form.get('subtotal'));
    const ivaType = form.get('ivaType');
    const ivaRate = ivaOptions.find(option => option.value === ivaType)?.rate || 0;
    const tax = subtotal * ivaRate;
    const total = subtotal + tax;
    const folio = form.get('folio');
    const id = `FAC-2026-${String(state.db.invoices.length + 1).padStart(3, '0')}`;
    state.db.invoices.push({ id, folio, contractId: contract.id, clientId: contract.clientId, type: form.get('type'), uuid: form.get('uuid') || `UUID-DEMO-${String(state.db.invoices.length + 1).padStart(3, '0')}`, issueDate: form.get('issueDate'), subtotal, tax, total, ivaType, status: 'PENDING', paidDate: null, balance: total, attachments: [] });
    contract.billedAmount += total;
    contract.pendingAmount = Math.max(0, contract.updatedAmount - contract.billedAmount);

    if (state.pendingInvoiceRequestId) {
      const request = byId(state.db.invoiceRequests, state.pendingInvoiceRequestId);
      if (request) {
        request.status = 'INVOICED';
        request.invoiceId = id;
        request.invoiceFolio = folio;
        request.invoicedAt = new Date().toISOString();
        const estimate = state.db.projects.flatMap(p => p.estimates || []).find(e => e.id === request.estimateId);
        if (estimate) estimate.status = 'INVOICED';
      }
      state.pendingInvoiceRequestId = null;
    }
    persistLocalData();
    showToast(`Factura ${folio || id} registrada con éxito.`, 'success');
    render();
  });
  const paymentForm = document.querySelector('#new-payment-form');
  if (paymentForm) paymentForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(paymentForm);
    const invoice = byId(state.db.invoices, form.get('invoiceId'));
    const amount = numericValue(form.get('amount'));
    const id = `PAG-2026-${String(state.db.payments.length + 1).padStart(3, '0')}`;
    state.db.payments.push({ id, invoiceId: invoice.id, contractId: invoice.contractId, date: form.get('date'), amount, method: form.get('method'), status: 'RECONCILED' });
    invoice.balance = Math.max(0, invoice.balance - amount);
    invoice.status = invoice.balance === 0 ? 'PAID' : 'PARTIALLY_PAID';
    invoice.paidDate = form.get('date');
    const contract = byId(state.db.contracts, invoice.contractId);
    contract.collectedAmount += amount;
    contract.pendingAmount = Math.max(0, contract.updatedAmount - contract.collectedAmount);
    persistLocalData();
    showToast(`Cobro registrado por ${money(amount)}.`, 'success');
    render();
  });
  document.querySelectorAll('[data-fill-invoice]').forEach(button => button.addEventListener('click', () => {
    const requestId = button.dataset.fillInvoice;
    const request = byId(state.db.invoiceRequests, requestId);
    if (!request) return;
    state.pendingInvoiceRequestId = requestId;
    const contract = byId(state.db.contracts, request.contractId);
    const form = document.querySelector('#new-invoice-form');
    if (!form) return;
    const contractSelect = form.querySelector('[name="contractId"]');
    if (contractSelect) contractSelect.value = request.contractId;
    const folioInput = form.querySelector('[name="folio"]');
    if (folioInput) folioInput.value = `FAC-EST-${String(request.estimateId || '').slice(-4) || '001'}`;
    const typeSelect = form.querySelector('[name="type"]');
    if (typeSelect) typeSelect.value = 'PROGRESS_ESTIMATE';
    const subtotalInput = form.querySelector('[name="subtotal"]');
    if (subtotalInput) subtotalInput.value = `$${Number(request.subtotal2 || request.amount).toLocaleString('en-US')}`;
    const ivaSelect = form.querySelector('[name="ivaType"]');
    if (ivaSelect) ivaSelect.value = contract?.ivaType || 'RATE_16';
    form.scrollIntoView({ behavior: 'smooth' });
    showToast(`Formulario de factura completado para solicitud ${request.id}.`, 'info');
  }));
}
function approvalControls(type, record) {
  const status = record.approvalStatus || record.status;
  if (activeRole().name === 'DIRECCION_GENERAL' && ['IN_REVIEW', 'PENDING'].includes(status)) return `<div class="approval-actions"><button type="button" class="action-button complete" data-approval-id="${record.id}" data-approval-type="${type}" data-approval-action="APPROVED">Aprobar</button><button type="button" class="action-button reject" data-approval-id="${record.id}" data-approval-type="${type}" data-approval-action="REJECTED">Rechazar</button></div>`;
  if (['CONTRACT', 'PURCHASE_ORDER'].includes(type) && ((type === 'CONTRACT' && activeRole().name === 'COMERCIAL_CONTRATOS' && can('contracts.create')) || (type === 'PURCHASE_ORDER' && activeRole().name === 'COMPRAS' && can('purchaseOrders.*'))) && ['DRAFT', 'REJECTED'].includes(status)) return `<button type="button" class="action-button complete" data-approval-id="${record.id}" data-approval-type="${type}" data-approval-action="IN_REVIEW">Enviar a revision</button>`;
  return badge(status);
}
function pendingActionsPanel() {
  const roleName = activeRole().name;
  const actions = state.db.pendingActions.filter(action => action.status === 'PENDING' && (roleName === 'DIRECCION_GENERAL' || action.department === roleName));
  return `<section class="panel"><div class="panel-heading"><h3>Acciones pendientes</h3><span>${actions.length} ${actions.length === 1 ? 'pendiente' : 'pendientes'}</span></div><div class="table-wrap"><table><thead><tr><th>Accion</th><th>Departamento</th><th>Referencia</th><th>Prioridad</th><th>Gestionar</th></tr></thead><tbody>${actions.map(action => `<tr><td>${action.title}</td><td>${departmentLabel(action.department)}</td><td><strong>${action.reference}</strong></td><td>${badge(action.priority === 'HIGH' ? 'PENDING' : 'IN_PROGRESS')}</td><td class="action-buttons"><button class="action-button complete" data-action-id="${action.id}" data-action-status="COMPLETED">Atender</button><button class="action-button reject" data-action-id="${action.id}" data-action-status="REJECTED">Rechazar</button></td></tr>`).join('')}</tbody></table></div></section>`;
}

const views = {
  dashboard() {
    const d = state.db.dashboard;
    const contracts = state.db.contracts.slice(0, 4);
    return `<div class="dashboard-view"><div class="intro"><h2>Buenos dias, ${activeUser().name.split(' ')[0]}</h2><p>Vista consolidada del negocio. Este panel cambia segun el usuario activo y sus permisos.</p></div>
      <div class="metrics">${metric('Contratado', money(d.contractedAmount), '2 contratos activos')}${metric('Facturado', money(d.billedAmount), '37% del total contratado')}${metric('Cobrado', money(d.collectedAmount), 'Conciliacion al dia')}${metric('Proyectos activos', d.activeProjects, '1 requiere seguimiento')}</div>
      <div class="grid"><section class="panel"><div class="panel-heading"><h3>Contratos recientes</h3><span>Vista de Direccion</span></div><div class="table-wrap"><table><thead><tr><th>Contrato</th><th>Cliente</th><th>Actualizado</th><th>Estado</th></tr></thead><tbody>${contracts.map(contract => `<tr><td><strong class="contract-link" data-contract-id="${contract.id}">${contract.contractNumber || contract.id}</strong></td><td>${byId(state.db.clients, contract.clientId).tradeName}</td><td>${money(contract.updatedAmount)}</td><td>${badge(contract.status)}</td></tr>`).join('')}</tbody></table></div></section>${pendingActionsPanel()}</div>${homeReimbursementSection()}</div>`;
  },
  clients() {
    const form = can('clients.*') ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nuevo cliente</h3><span>Datos fiscales y contacto</span></div><form id="new-client-form" class="form-grid"><label>Razón social<input name="legalName" required></label><label>Nombre comercial<input name="tradeName" required></label><label>RFC<input name="taxId" required></label><label>Contacto<input name="contact" required></label><label>Correo<input name="email" type="email"></label><label>Teléfono<input name="phone"></label><button class="primary-button" type="submit">Guardar cliente</button></form></section>` : '';
    return `<div class="intro"><h2>Clientes</h2><p>Administra clientes y sus datos fiscales para relacionarlos con contratos.</p></div>${form}<section class="panel"><div class="panel-heading"><h3>Directorio de clientes</h3><span>${state.db.clients.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Cliente</th><th>RFC</th><th>Contacto</th><th>Correo</th><th>Estado</th></tr></thead><tbody>${state.db.clients.map(client => `<tr><td><strong>${client.tradeName}</strong><br><small>${client.legalName}</small></td><td>${client.taxId}</td><td>${client.contact}</td><td>${client.email}</td><td>${badge(client.status)}</td></tr>`).join('')}</tbody></table></div></section>`;
  },
  contracts() {
    const selected = byId(state.db.contracts, state.selectedContractId);
    if (selected) return state.editingContractId ? editContractView(selected) : contractDetail(selected);
    const ivaSelect = name => `<select name="${name}" required>${ivaOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}</select>`;
    const retentionFields = id => `<div class="retention-fields"><span>Retenciones</span><div id="${id}" class="retention-list"></div><button type="button" class="link-button add-retention" data-add-retention="${id}">+ Agregar retención</button></div>`;
    const advanceFields = () => `<div class="advance-fields"><label>Tipo de anticipo<select name="advanceMode"><option value="PERCENTAGE">Porcentaje</option><option value="AMOUNT">Importe</option></select></label><label>Valor<input name="advanceValue" data-number-format="percentage" inputmode="decimal" value="0%"></label></div>`;
    const createForm = can('contracts.create') ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nuevo contrato</h3><span>Captura inicial</span></div><form id="new-contract-form" class="form-grid"><label>Número de contrato<input name="contractNumber" placeholder="Ej. CT-2026-003" required></label><label>Nombre del contrato<input name="contractName" placeholder="Ej. Mantenimiento anual" required></label><label>Cliente<select name="clientId" required>${state.db.clients.map(client => `<option value="${client.id}">${client.tradeName}</option>`).join('')}</select></label><label>Subtotal<input name="amount" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>IVA${ivaSelect('ivaType')}</label>${advanceFields()}${retentionFields('contract-retentions')}<label>Archivos de respaldo<input name="attachments" type="file" multiple accept=".pdf,.xml,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"></label><label>Fecha de inicio<input name="date" type="date" value="2026-09-08" required></label><label>Fecha de termino<input name="endDate" type="date" required></label><button class="primary-button" type="submit">Crear contrato</button></form></section>` : '';
    const changeForm = can('changeOrders.*') ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nueva orden de cambio</h3><span>Puede ser positiva o negativa</span></div><form id="change-order-form" class="form-grid"><label>Contrato<select name="contractId" required>${state.db.contracts.map(contract => `<option value="${contract.id}">${contract.contractNumber || contract.id}</option>`).join('')}</select></label><label>Subtotal<input name="amount" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>IVA${ivaSelect('ivaType')}</label>${advanceFields()}${retentionFields('change-retentions')}<label>Archivos de respaldo<input name="attachments" type="file" multiple accept=".pdf,.xml,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"></label><label>Fecha de inicio<input name="date" type="date" value="2026-09-08" required></label><label>Fecha de término<input name="endDate" type="date" required></label><label>Descripcion<input name="description" required></label><button class="primary-button" type="submit">Registrar cambio</button></form></section>` : '';
    return `<div class="intro"><h2>Cartera contractual</h2><p>Consulta el importe original, cambios autorizados, facturacion y saldo por cliente.</p></div>${createForm}${changeForm}<section class="panel"><div class="panel-heading"><h3>Todos los contratos</h3><span>${state.db.contracts.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Nombre</th><th>Cliente</th><th>Original</th><th>Cambios</th><th>Facturado</th><th>Saldo</th><th>Autorización</th><th></th></tr></thead><tbody>${state.db.contracts.map(contract => `<tr><td><strong class="contract-link" data-contract-id="${contract.id}">${contract.contractNumber || contract.id}</strong></td><td><span class="contract-link" data-contract-id="${contract.id}">${contract.contractName || 'Sin nombre'}</span></td><td>${byId(state.db.clients, contract.clientId).tradeName}</td><td>${money(contract.originalAmount)}</td><td>${money(contract.changeOrderAmount)}</td><td>${money(contract.billedAmount)}</td><td>${money(contract.pendingAmount)}</td><td>${approvalControls('CONTRACT', contract)}</td><td>${['DRAFT', 'IN_REVIEW'].includes(contract.approvalStatus) && can('contracts.update') ? `<button class="link-button" data-edit-contract="${contract.id}">Editar</button>` : ''}</td></tr>`).join('')}</tbody></table></div></section>`;
  },
  projects() { return projectView(); },
  finance() { return financeView('general'); },
  billing() { return financeView('billing'); },
  collections() { return financeView('collections'); },
  purchases() { return inventoryView('purchases'); },
  masterCatalog() { return masterCatalogView(); },
  warehouse() { return warehouseView(); },
  people() { return employeeView(); },
  hrChanges() { return hrChangesView(); },
  hrPositions() { return positionCatalog(); },
  hrIncidents() { return hrIncidentsView(); },
  hrVacations() { return hrVacationsView(); }
  ,reimbursements() { return reimbursementView(); }
};

function bindInventoryForms() {
  const unitForm = document.querySelector('#master-unit-form');
  if (unitForm) unitForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(unitForm);
    const value = String(form.get('value') || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const label = String(form.get('label') || '').trim();
    if (!value || !label || currentUnitOptions().some(unit => unit.value === value)) { window.alert('La unidad debe tener un código único y un nombre.'); return; }
    state.db.measurementUnits.push({ value, label });
    persistLocalData();
    render();
  });
  document.querySelectorAll('.catalog-edit-unit').forEach(button => button.addEventListener('click', () => {
    const unit = currentUnitOptions().find(option => option.value === button.dataset.unitValue);
    if (!unit) return;
    const label = window.prompt('Nombre de la unidad de medida:', unit.label);
    if (!label?.trim()) return;
    unit.label = label.trim();
    persistLocalData();
    render();
  }));
  const masterProductForm = document.querySelector('#master-product-form');
  if (masterProductForm) masterProductForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(masterProductForm);
    const code = String(form.get('code') || '').trim().toUpperCase();
    if (state.db.products.some(product => product.code.toUpperCase() === code)) { window.alert('Ya existe un producto con ese código.'); return; }
    state.db.products.push({ id: `PRD-${String(state.db.products.length + 1).padStart(3, '0')}`, code, description: form.get('description'), category: form.get('category'), brand: form.get('brand'), model: form.get('model'), unit: form.get('unitOfMeasure'), unitOfMeasure: form.get('unitOfMeasure'), cost: numericValue(form.get('cost')), price: 0, supplierId: form.get('supplierId'), minimumStock: Number(form.get('minimumStock') || 0), status: 'ACTIVE' });
    persistLocalData();
    render();
  });
  const masterSupplierForm = document.querySelector('#master-supplier-form');
  if (masterSupplierForm) masterSupplierForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(masterSupplierForm);
    state.db.suppliers.push({ id: `PRV-${String(state.db.suppliers.length + 1).padStart(3, '0')}`, legalName: form.get('legalName'), taxId: String(form.get('taxId') || '').toUpperCase(), contact: form.get('contact'), phone: form.get('phone'), status: 'ACTIVE' });
    persistLocalData();
    render();
  });
  const purchaseForm = document.querySelector('#new-purchase-order-form');
  if (purchaseForm) purchaseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(purchaseForm);
    const itemRows = [...purchaseForm.querySelectorAll('[data-purchase-item]')];
    const items = itemRows.map(row => {
      const quantity = Number(row.querySelector('[name="quantity"]').value);
      const unitCost = numericValue(row.querySelector('[name="unitCost"]').value);
      const unitSelect = row.querySelector('[name="unitOfMeasure"]');
      return { productId: row.querySelector('[name="productId"]').value, quantity, unitCost, unitOfMeasure: unitSelect.value === 'OTHER' ? row.querySelector('[name="customUnit"]').value.trim() : unitSelect.value };
    }).filter(item => item.productId && item.quantity > 0 && item.unitCost >= 0 && item.unitOfMeasure);
    if (!items.length) { window.alert('Agrega al menos una partida válida.'); return; }
    const id = `OCM-2026-${String(state.db.purchaseOrders.length + 1).padStart(3, '0')}`;
    const attachments = await readFiles(purchaseForm.querySelector('[name="attachments"]').files);
    state.db.purchaseOrders.push({ id, supplierId: form.get('supplierId'), contractId: form.get('contractId') || null, projectId: form.get('projectId') || null, date: form.get('date'), status: 'DRAFT', approvalStatus: 'DRAFT', total: items.reduce((total, item) => total + item.quantity * item.unitCost, 0), attachments, items });
    persistLocalData();
    render();
  });
  document.querySelector('[data-add-purchase-item]')?.addEventListener('click', () => {
    const container = document.querySelector('#purchase-items');
    const template = container?.querySelector('[data-purchase-item]');
    if (!container || !template) return;
    const row = template.cloneNode(true);
    row.querySelectorAll('input').forEach(input => { input.value = ''; });
    row.querySelectorAll('select').forEach(select => { select.selectedIndex = 0; });
    row.querySelector('.remove-purchase-item')?.addEventListener('click', () => {
      if (container.querySelectorAll('[data-purchase-item]').length > 1) row.remove();
    });
    container.appendChild(row);
  });
  document.querySelectorAll('.remove-purchase-item').forEach(button => button.addEventListener('click', () => {
    const rows = document.querySelectorAll('[data-purchase-item]');
    if (rows.length > 1) button.closest('[data-purchase-item]')?.remove();
  }));
  const movementForm = document.querySelector('#inventory-movement-form');
  if (movementForm) movementForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(movementForm);
    const item = byId(state.db.inventory, form.get('productId'));
    const quantity = Number(form.get('quantity'));
    const type = form.get('movementType');
    if (type === 'ENTRY') item.onHand += quantity;
    if (type === 'EXIT') item.onHand = Math.max(0, item.onHand - quantity);
    if (type === 'COMMIT') item.committed += quantity;
    if (type === 'RELEASE') item.committed = Math.max(0, item.committed - quantity);
    item.unitOfMeasure = form.get('unitOfMeasure') === 'OTHER' ? (form.get('customUnit') || item.unitOfMeasure) : form.get('unitOfMeasure');
    item.available = Math.max(0, item.onHand - item.committed);
    item.lastMovement = form.get('date');
    state.db.inventoryMovements.push({ id: `MOV-${Date.now()}`, productId: item.productId, type, quantity, unitOfMeasure: item.unitOfMeasure, date: form.get('date'), reference: form.get('reference') || null, projectId: form.get('projectId') || null, userId: activeUser().id });
    persistLocalData();
    render();
  });
  const receiptForm = document.querySelector('#inventory-receipt-form');
  const refreshReceiptItems = () => {
    if (!receiptForm) return;
    const order = byId(state.db.purchaseOrders, receiptForm.querySelector('[name="purchaseOrderId"]')?.value);
    const itemSelect = receiptForm.querySelector('[name="itemIndex"]');
    const unitField = receiptForm.querySelector('[name="unitOfMeasure"]');
    if (!order || !itemSelect || !unitField) return;
    const options = order.items.map((item, index) => { const product = byId(state.db.products, item.productId); const remaining = item.quantity - (item.receivedQuantity || 0); return remaining > 0 ? `<option value="${index}">${product?.code || item.productId} · pendiente ${remaining} ${unitLabel(item.unitOfMeasure)}</option>` : ''; }).join('');
    itemSelect.innerHTML = options;
    const item = order.items[Number(itemSelect.value)];
    unitField.value = unitLabel(item?.unitOfMeasure);
  };
  receiptForm?.querySelector('[name="purchaseOrderId"]')?.addEventListener('change', refreshReceiptItems);
  receiptForm?.querySelector('[name="itemIndex"]')?.addEventListener('change', refreshReceiptItems);
  if (receiptForm) receiptForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(receiptForm);
    const order = byId(state.db.purchaseOrders, form.get('purchaseOrderId'));
    const itemIndex = Number(form.get('itemIndex'));
    const itemLine = order?.items?.[itemIndex];
    const inventoryItem = byId(state.db.inventory, itemLine?.productId);
    const quantity = Number(form.get('quantity'));
    if (!order || !itemLine || !inventoryItem || quantity <= 0) return;
    const remaining = itemLine.quantity - (itemLine.receivedQuantity || 0);
    if (quantity > remaining) {
      window.alert(`La cantidad recibida no puede superar las ${remaining} unidades pendientes.`);
      return;
    }
    itemLine.receivedQuantity = (itemLine.receivedQuantity || 0) + quantity;
    inventoryItem.onHand += quantity;
    inventoryItem.unitOfMeasure = itemLine.unitOfMeasure || inventoryItem.unitOfMeasure;
    inventoryItem.available = Math.max(0, inventoryItem.onHand - inventoryItem.committed);
    inventoryItem.lastMovement = form.get('date');
    order.status = itemLine.receivedQuantity === itemLine.quantity ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    if (order.items.some(item => (item.receivedQuantity || 0) < item.quantity)) order.status = 'PARTIALLY_RECEIVED';
    order.receivedDate = form.get('date');
    state.db.inventoryMovements.push({ id: `MOV-${Date.now()}`, productId: itemLine.productId, type: 'RECEIPT', quantity, unitOfMeasure: itemLine.unitOfMeasure, date: form.get('date'), reference: order.id, projectId: order.projectId || null, userId: activeUser().id });
    persistLocalData();
    render();
  });
}
function bindWarehouseTabs() {
  const tabs = document.querySelectorAll('[data-warehouse-tab]');
  const panels = document.querySelectorAll('[data-warehouse-panel]');
  if (!tabs.length) return;
  const activate = tabName => {
    localStorage.setItem('rinosoft.warehouseTab', tabName);
    tabs.forEach(tab => { const active = tab.dataset.warehouseTab === tabName; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
    panels.forEach(panel => { panel.hidden = panel.dataset.warehousePanel !== tabName; });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.warehouseTab)));
  activate(localStorage.getItem('rinosoft.warehouseTab') || 'summary');
}
function bindCatalogTabs() {
  const tabs = document.querySelectorAll('[data-catalog-tab]');
  const panels = document.querySelectorAll('[data-catalog-panel]');
  if (!tabs.length) return;
  const activate = tabName => {
    tabs.forEach(tab => { const active = tab.dataset.catalogTab === tabName; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
    panels.forEach(panel => { panel.hidden = panel.dataset.catalogPanel !== tabName; });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.catalogTab)));
  activate('products');
}
function bindProjectTabs() {
  const tabs = document.querySelectorAll('[data-project-tab]');
  const panels = document.querySelectorAll('[data-project-panel]');
  if (!tabs.length) return;
  const activate = tabName => {
    localStorage.setItem('rinosoft.projectTab', tabName);
    tabs.forEach(tab => { const active = tab.dataset.projectTab === tabName; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
    panels.forEach(panel => { panel.hidden = panel.dataset.projectPanel !== tabName; });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.projectTab)));
  activate(localStorage.getItem('rinosoft.projectTab') || 'summary');
}
function bindReimbursementForms() {
  const form = document.querySelector('#new-reimbursement-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const batchId = `SOL-REI-2026-${String(state.db.reimbursements.length + 1).padStart(3, '0')}`;
    const rows = [...form.querySelectorAll('[data-reimbursement-row]')];
    const entries = await Promise.all(rows.map(async (row, index) => {
      const employeeIdField = row.querySelector('[name="employeeId"]');
      const workerIdField = row.querySelector('[name="workerId"]');
      const employeeIdValue = employeeIdField?.value || '';
      const workerIdValue = String(workerIdField?.value || '').trim();
      const matchedEmployee = activeEmployeeContext() ? byId(state.db.employees, employeeIdValue) || findActiveEmployeeByWorkerId(workerIdValue) : (findActiveEmployeeByWorkerId(workerIdValue) || byId(state.db.employees, employeeIdValue));
      if (!matchedEmployee || matchedEmployee.status !== 'ACTIVE') {
        throw new Error('Solo pueden solicitar reembolso trabajadores activos con un ID válido.');
      }
      const files = await readFiles(row.querySelector('[name="supportFiles"]').files);
      return { id: `${batchId}-${index + 1}`, batchId, employeeId: matchedEmployee.id, workerId: matchedEmployee.workerId || matchedEmployee.employeeNumber || matchedEmployee.id, projectId: row.querySelector('[name="projectId"]').value || null, projectName: row.querySelector('[name="projectName"]').value.trim() || null, concept: row.querySelector('[name="concept"]').value, category: row.querySelector('[name="category"]').value, amount: numericValue(row.querySelector('[name="amount"]').value), requestDate: row.querySelector('[name="requestDate"]').value, attachments: files, status: 'PENDING', reviewedBy: null, reviewedAt: null };
    }));
    try {
      state.db.reimbursements.push(...entries.filter(entry => entry.concept && entry.amount > 0 && entry.requestDate));
      persistLocalData();
      render();
    } catch (error) {
      window.alert(error.message || 'No se pudo guardar la solicitud de reembolso.');
    }
  });
  document.querySelectorAll('[data-add-reimbursement]').forEach(button => button.addEventListener('click', () => {
    const container = document.querySelector('#reimbursement-rows');
    const row = document.createElement('div');
    row.className = 'reimbursement-row';
    row.dataset.reimbursementRow = 'true';
    row.innerHTML = reimbursementRowHtml();
    row.querySelector('.remove-reimbursement').addEventListener('click', () => row.remove());
    applyWorkerFilterToRow(row);
    container.appendChild(row);
  }));
  document.querySelectorAll('.remove-reimbursement').forEach(button => button.addEventListener('click', () => button.closest('[data-reimbursement-row]').remove()));
  document.querySelectorAll('[data-reimbursement-id]').forEach(button => button.addEventListener('click', () => {
    if (!['DIRECCION_GENERAL', 'FINANZAS'].includes(activeRole().name)) return;
    const reimbursement = byId(state.db.reimbursements, button.dataset.reimbursementId);
    const status = button.dataset.reimbursementStatus;
    if (status === 'REJECTED' && !window.confirm('¿Rechazar esta solicitud de reembolso?')) return;
    reimbursement.status = status;
    reimbursement.reviewedBy = activeUser().id;
    reimbursement.reviewedAt = new Date().toISOString();
    persistLocalData();
    render();
  }));
  form.querySelectorAll('[data-reimbursement-row]').forEach(row => applyWorkerFilterToRow(row));
}
function projectView() {
  const form = can('projects.*') ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nuevo proyecto</h3><span>Asignación a contrato</span></div><form id="new-project-form" class="form-grid"><label>Contrato<select name="contractId" required>${state.db.contracts.filter(contract => !contract.projectId).map(contract => `<option value="${contract.id}">${contract.contractNumber || contract.id} · ${contract.contractName || 'Sin nombre'}</option>`).join('')}</select></label><label>Nombre del proyecto<input name="name" required></label><label>Responsable<select name="managerEmployeeId" required>${state.db.employees.filter(employee => employee.status === 'ACTIVE').map(employee => `<option value="${employee.id}">${employee.name}</option>`).join('')}</select></label><label>Presupuesto<input name="budget" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>Próximo hito<input name="nextMilestone" required></label><button class="primary-button" type="submit">Guardar proyecto</button></form></section>` : '';
  const editingEstimate = state.editingEstimateId ? state.db.projects.flatMap(project => project.estimates || []).find(estimate => estimate.id === state.editingEstimateId) : null;
  const editingRetentionRows = editingEstimate?.retentionRates?.length ? editingEstimate.retentionRates.map(retention => `<div class="retention-row" data-retention-row="true"><input name="retentionConcept" value="${retentionConcept(retention)}" required><select name="retentionMode"><option value="PERCENTAGE" ${retentionMode(retention) === 'PERCENTAGE' ? 'selected' : ''}>%</option><option value="AMOUNT" ${retentionMode(retention) === 'AMOUNT' ? 'selected' : ''}>$</option></select><input name="retentionValue" value="${retentionMode(retention) === 'PERCENTAGE' ? retentionRate(retention) * 100 : retentionValue(retention)}" data-number-format="${retentionMode(retention) === 'AMOUNT' ? 'currency' : 'percentage'}" inputmode="decimal" required><button type="button" class="remove-retention">×</button></div>`).join('') : '';
  const estimateRetentionRow = editingRetentionRows || `<div class="retention-row" data-retention-row="true"><input name="retentionConcept" placeholder="Ej. Garantía"><select name="retentionMode"><option value="PERCENTAGE">%</option><option value="AMOUNT">$</option></select><input name="retentionValue" data-number-format="percentage" inputmode="decimal" placeholder="Valor"><button type="button" class="remove-retention" aria-label="Eliminar retención">×</button></div>`;
  const defaultProjectId = editingEstimate?.projectId || state.db.projects[0]?.id;
  const defaultProject = byId(state.db.projects, defaultProjectId);
  const defaultContract = byId(state.db.contracts, defaultProject?.contractId);
  const defaultIvaType = editingEstimate?.ivaType || defaultContract?.ivaType || 'RATE_16';
  const availableAdvanceForForm = defaultContract ? getAvailableContractAdvance(defaultContract.id, state.editingEstimateId) : 0;
  const advanceBadgeHtml = defaultContract ? `<div class="advance-badge">💳 <strong>Anticipo disponible por amortizar:</strong> ${money(availableAdvanceForForm)} (Contrato: ${defaultContract.contractNumber || defaultContract.id})</div>` : '';
  const estimateForm = can('projects.*') ? `<section class="panel form-panel"><div class="panel-heading"><h3>${editingEstimate ? 'Editar estimación' : 'Nueva estimación'}</h3><span>Desglose fiscal por contrato</span></div><p class="project-help">Las retenciones porcentuales se calculan siempre sobre el Subtotal 1. Subtotal 1 - amortizaciones - retenciones = subtotal 2; después se agrega el IVA para obtener el total.</p>${advanceBadgeHtml}<form id="new-estimate-form" class="form-grid"><input type="hidden" name="estimateId" value="${editingEstimate?.id || ''}"><label>Proyecto<select name="projectId" required>${state.db.projects.map(project => `<option value="${project.id}" ${project.id === defaultProjectId ? 'selected' : ''}>${project.name} · ${project.contractId}</option>`).join('')}</select></label><label>Fecha<input name="date" type="date" value="${editingEstimate?.date || '2026-09-08'}" required></label><label>Descripción<input name="description" value="${editingEstimate?.description || ''}" placeholder="Ej. Estimación de avance 01" required></label><label>Subtotal<input name="subtotal" data-number-format="currency" inputmode="decimal" value="${editingEstimate?.subtotal || ''}" placeholder="$0" required></label><label>Amortizaciones<input name="amortization" data-number-format="currency" inputmode="decimal" value="${editingEstimate?.amortization || 0}" placeholder="$0" required></label><label>IVA<select name="ivaType" required>${ivaOptions.map(option => `<option value="${option.value}" ${option.value === defaultIvaType ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label><div class="retention-fields"><span>Retenciones</span><div id="estimate-retentions" class="retention-list">${estimateRetentionRow}</div><button type="button" class="link-button add-retention" data-add-retention="estimate-retentions">+ Agregar retención</button></div><button class="primary-button" type="submit">${editingEstimate ? 'Actualizar estimación' : 'Guardar estimación'}</button>${editingEstimate ? '<button type="button" class="link-button" data-clear-estimate-edit>Cancelar edición</button>' : ''}</form></section>` : '';
  const rows = state.db.projects.map(project => { const contract = byId(state.db.contracts, project.contractId); const estimates = project.estimates || []; const estimated = estimates.reduce((total, estimate) => total + Number(estimate.amount || 0), 0); const retained = estimates.reduce((total, estimate) => total + Number(estimate.retentionAmount || 0), 0); return `<tr><td><strong>${project.name}</strong><br><small>${project.nextMilestone}</small></td><td>${contract?.contractNumber || project.contractId}</td><td>${byId(state.db.employees, project.managerEmployeeId)?.name || 'Sin asignar'}</td><td>${project.progressPercent}%</td><td>${money(project.budget)}</td><td>${money(estimated)}</td><td>${money(retained)}</td><td>${money(contract?.updatedAmount || 0)}</td><td>${badge(project.status)}</td></tr>`; }).join('');
  const estimateRows = state.db.projects.flatMap(project => (project.estimates || []).map(estimate => { const contract = byId(state.db.contracts, estimate.contractId || project.contractId); const actions = estimate.status === 'DRAFT' || estimate.status === 'REJECTED' ? `<button type="button" class="action-button complete" data-estimate-action="EDIT" data-estimate-id="${estimate.id}">Editar</button> <button type="button" class="action-button complete" data-estimate-action="REVIEW" data-estimate-id="${estimate.id}">Enviar a revisión</button>` : estimate.status === 'IN_REVIEW' && activeRole().name === 'DIRECCION_GENERAL' ? `<button type="button" class="action-button complete" data-estimate-action="APPROVE" data-estimate-id="${estimate.id}">Aprobar</button> <button type="button" class="action-button reject" data-estimate-action="REJECT" data-estimate-id="${estimate.id}">Rechazar</button>` : estimate.status === 'APPROVED' ? `<button type="button" class="action-button complete" data-estimate-action="INVOICE" data-estimate-id="${estimate.id}">Solicitar factura</button>` : '-'; const rejection = estimate.rejectionReason ? `<br><small class="rejection-reason">Motivo: ${estimate.rejectionReason}</small>` : ''; return `<tr><td>${estimate.id}</td><td><strong>${contract?.contractNumber || estimate.contractId || project.contractId}</strong></td><td>${project.name}</td><td>${estimate.date}</td><td>${estimate.description}${rejection}</td><td>${money(estimate.subtotal ?? estimate.amount)}</td><td>${money(estimate.amortization || 0)}</td><td>${money(estimate.retentionAmount || 0)}<br><small>${retentionText(estimate.retentionRates || [])}</small></td><td>${money(estimate.subtotal2 ?? estimate.netAmount)}</td><td>${ivaLabel(estimate.ivaType)} · ${money(estimate.ivaAmount || 0)}</td><td>${money(estimate.total ?? estimate.netAmount)}</td><td>${badge(estimate.status)}</td><td>${actions}</td></tr>`; })).join('');
  const changeRows = state.db.changeOrders.map(order => { const contract = byId(state.db.contracts, order.contractId); return `<tr><td>${order.id}</td><td>${contract?.contractNumber || order.contractId}</td><td>${order.description}</td><td>${money(order.amount)}</td><td>${badge(order.status)}</td><td>${money(contract?.updatedAmount || 0)}</td></tr>`; }).join('');
  const totalContracted = state.db.contracts.reduce((sum, contract) => sum + Number(contract.updatedAmount || 0), 0);
  const totalEstimated = state.db.projects.reduce((sum, project) => sum + (project.estimates || []).reduce((value, estimate) => value + Number(estimate.total || estimate.amount || 0), 0), 0);
  return `<div class="intro"><h2>Proyectos en seguimiento</h2><p>Administra proyectos, estimaciones y el impacto de las órdenes de cambio.</p></div><nav class="warehouse-tabs project-tabs" role="tablist" aria-label="Secciones de proyectos"><button type="button" data-project-tab="summary" aria-selected="true">Resumen</button><button type="button" data-project-tab="projects" aria-selected="false">Proyectos</button><button type="button" data-project-tab="estimates" aria-selected="false">Estimaciones</button><button type="button" data-project-tab="changes" aria-selected="false">Órdenes de cambio</button></nav><section data-project-panel="summary"><div class="metrics">${metric('Proyectos', state.db.projects.length, 'En seguimiento')}${metric('Contratos', state.db.contracts.length, 'Relacionados')}${metric('Contratado', money(totalContracted), 'Con cambios aprobados')}${metric('Estimado', money(totalEstimated), 'Importe acumulado')}</div><section class="panel"><div class="panel-heading"><h3>Vista general</h3><span>Control contractual</span></div><div class="detail-body"><p>Usa las pestañas para trabajar por separado con proyectos, estimaciones y órdenes de cambio.</p></div></section></section><section data-project-panel="projects" hidden>${pendingActionsPanel()}${form}<section class="panel"><div class="panel-heading"><h3>Proyectos y contratos</h3><span>${state.db.projects.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Proyecto</th><th>Contrato</th><th>Responsable</th><th>Avance</th><th>Presupuesto</th><th>Estimado</th><th>Retenciones</th><th>Total contrato</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div></section></section><section data-project-panel="estimates" hidden>${estimateForm}<section class="panel"><div class="panel-heading"><h3>Estimaciones registradas</h3><span>${estimateRows ? 'Detalle por contrato' : 'Sin estimaciones'}</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Contrato</th><th>Proyecto</th><th>Fecha</th><th>Descripción</th><th>Subtotal</th><th>Amortizaciones</th><th>Retenciones</th><th>Subtotal 2</th><th>IVA</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${estimateRows || '<tr><td colspan="13">No hay estimaciones registradas.</td></tr>'}</tbody></table></div></section></section><section data-project-panel="changes" hidden><section class="panel"><div class="panel-heading"><h3>Órdenes de cambio</h3><span>${state.db.changeOrders.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Contrato</th><th>Descripción</th><th>Importe</th><th>Estado</th><th>Total contrato</th></tr></thead><tbody>${changeRows || '<tr><td colspan="6">No hay órdenes de cambio registradas.</td></tr>'}</tbody></table></div></section></section>`;
}
function financeView(section = 'general') {
  const ivaSelect = `<select name="ivaType" required>${ivaOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}</select>`;
  const invoiceRequestPanel = activeRole().name === 'FINANZAS' ? `<section class="panel"><div class="panel-heading"><h3>Solicitudes de factura por estimación</h3><span>${state.db.invoiceRequests.filter(request => request.status === 'PENDING').length} pendientes</span></div><p class="project-help">La solicitud conserva el Subtotal 2 de la estimación, el IVA y el Total.</p><div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Estimación</th><th>Contrato</th><th>Subtotal 2</th><th>IVA</th><th>Total</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${state.db.invoiceRequests.map(request => `<tr><td>${request.id}</td><td>${request.estimateId}</td><td>${request.contractId}</td><td>${money(request.subtotal2 ?? request.subtotal ?? request.amount)}</td><td>${money(request.ivaAmount || 0)}</td><td><strong>${money(request.total ?? request.amount)}</strong></td><td>${request.requestedAt?.slice(0, 10) || '-'}</td><td>${badge(request.status)}</td><td>${request.status === 'PENDING' ? `<button type="button" class="action-button complete" data-fill-invoice="${request.id}">Facturar</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="9">No hay solicitudes de factura.</td></tr>'}</tbody></table></div></section>` : '';
  const invoiceForm = can('invoices.*') ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nueva factura</h3><span>Solicitud validada por Finanzas</span></div><form id="new-invoice-form" class="form-grid"><label>Contrato<select name="contractId" required>${state.db.contracts.filter(contract => ['SIGNED', 'IN_PROGRESS'].includes(contract.status)).map(contract => `<option value="${contract.id}">${contract.contractNumber || contract.id}</option>`).join('')}</select></label><label>Folio<input name="folio" placeholder="Ej. F-2026-001" required></label><label>UUID<input name="uuid" placeholder="Se genera si queda vacío"></label><label>Tipo<select name="type"><option value="ADVANCE">Anticipo</option><option value="PROGRESS_ESTIMATE">Estimación</option><option value="FINAL">Final</option></select></label><label>Subtotal<input name="subtotal" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>IVA${ivaSelect}</label><label>Fecha<input name="issueDate" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar factura</button></form></section>` : '';
  const paymentForm = can('payments.*') && state.db.invoices.some(invoice => invoice.balance > 0) ? `<section class="panel form-panel"><div class="panel-heading"><h3>Registrar cobro</h3><span>Aplicación a factura</span></div><form id="new-payment-form" class="form-grid"><label>Factura<select name="invoiceId" required>${state.db.invoices.filter(invoice => invoice.balance > 0).map(invoice => `<option value="${invoice.id}">${invoice.id} · saldo ${money(invoice.balance)}</option>`).join('')}</select></label><label>Importe<input name="amount" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>Método<select name="method"><option value="BANK_TRANSFER">Transferencia</option><option value="CHECK">Cheque</option><option value="CASH">Efectivo</option></select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar cobro</button></form></section>` : '';
  const title = section === 'billing' ? 'Facturación' : section === 'collections' ? 'Cobranza' : 'Administración y finanzas';
  const description = section === 'billing' ? 'Emite facturas de anticipo, estimación y cierre.' : section === 'collections' ? 'Registra cobros y aplica pagos a facturas.' : 'Gestiona facturación, pagos y saldos vinculados a contratos.';
  return `<div class="intro"><h2>${title}</h2><p>${description}</p></div>${invoiceRequestPanel}${section !== 'collections' ? invoiceForm : ''}${section !== 'billing' ? paymentForm : ''}<section class="panel"><div class="panel-heading"><h3>${section === 'collections' ? 'Facturas con saldo' : 'Facturas emitidas'}</h3><span>${state.db.invoices.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>UUID</th><th>Contrato</th><th>Tipo</th><th>Subtotal</th><th>IVA</th><th>Total</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>${state.db.invoices.map(invoice => `<tr><td><strong>${invoice.folio || invoice.id}</strong></td><td><small>${invoice.uuid}</small></td><td>${invoice.contractId}</td><td>${invoice.type}</td><td>${money(invoice.subtotal)}</td><td>${ivaLabel(invoice.ivaType)} · ${money(invoice.tax)}</td><td>${money(invoice.total)}</td><td>${money(invoice.balance)}</td><td>${badge(invoice.status)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function inventoryView(section) {
  const units = currentUnitOptions().map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  const productOptions = state.db.products.map(product => `<option value="${product.id}">${product.code} · ${product.description}</option>`).join('');
  const purchaseItem = `<div class="purchase-item"><label>Producto<select name="productId" required>${productOptions}</select></label><label>Cantidad<input name="quantity" type="number" min="0.01" step="0.01" required></label><label>Unidad de medida<select name="unitOfMeasure" required>${units}</select></label><label>Otra unidad<input name="customUnit" placeholder="Ej. Tonelada"></label><label>Costo unitario<input name="unitCost" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><button type="button" class="link-button remove-purchase-item">Eliminar partida</button></div>`;
  const receiptOrders = state.db.purchaseOrders.filter(order => ['APPROVED', 'PARTIALLY_RECEIVED'].includes(order.status));
  const receiptItems = receiptOrders[0]?.items || [];
  const receiptOptions = receiptItems.map((item, index) => { const product = byId(state.db.products, item.productId); const remaining = item.quantity - (item.receivedQuantity || 0); return remaining > 0 ? `<option value="${index}">${product?.code || item.productId} · pendiente ${remaining} ${unitLabel(item.unitOfMeasure)}</option>` : ''; }).join('');
  const purchaseForm = section === 'purchases' && activeRole().name === 'COMPRAS' ? `<section class="panel form-panel"><div class="panel-heading"><h3>Nueva orden de compra</h3><span>Compra para almacén o contrato</span></div><form id="new-purchase-order-form" class="form-grid"><label>Proveedor<select name="supplierId" required>${state.db.suppliers.map(supplier => `<option value="${supplier.id}">${supplier.legalName}</option>`).join('')}</select></label><div id="purchase-items"><div data-purchase-item>${purchaseItem}</div></div><button type="button" class="link-button" data-add-purchase-item>+ Agregar otra partida</button><label>Contrato<select name="contractId"><option value="">Compra para almacén</option>${state.db.contracts.map(contract => `<option value="${contract.id}">${contract.contractNumber || contract.id}</option>`).join('')}</select></label><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${state.db.projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('')}</select></label><label>Cotizaciones<input name="attachments" type="file" multiple accept=".pdf,.xml,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar orden</button></form></section>` : '';
  const movementForm = section === 'warehouse' ? `<section class="panel form-panel"><div class="panel-heading"><h3>Movimiento de almacén</h3><span>Entrada, salida o compromiso</span></div><form id="inventory-movement-form" class="form-grid"><label>Producto<select name="productId" required>${state.db.inventory.map(item => { const product = byId(state.db.products, item.productId); return `<option value="${item.productId}">${product.code} · disponible ${item.available}</option>`; }).join('')}</select></label><label>Unidad de medida<select name="unitOfMeasure" required>${units}</select></label><label>Movimiento<select name="movementType"><option value="ENTRY">Entrada</option><option value="EXIT">Salida</option><option value="COMMIT">Comprometer</option><option value="RELEASE">Liberar compromiso</option></select></label><label>Cantidad<input name="quantity" type="number" min="1" step="0.01" required></label><label>Referencia<input name="reference" placeholder="Orden, vale o documento"></label><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${state.db.projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('')}</select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar movimiento</button></form></section>` : '';
  const receiptForm = section === 'warehouse' ? `<section class="panel form-panel"><div class="panel-heading"><h3>Recibir orden aprobada</h3><span>Entrada vinculada a compra</span></div><form id="inventory-receipt-form" class="form-grid"><label>Orden de compra<select name="purchaseOrderId" required>${receiptOrders.map(order => `<option value="${order.id}">${order.id} · ${order.items.filter(item => (item.receivedQuantity || 0) < item.quantity).length} partidas pendientes</option>`).join('')}</select></label><label>Partida<select name="itemIndex" required>${receiptOptions}</select></label><label>Unidad de medida<input name="unitOfMeasure" value="${unitLabel(receiptItems[0]?.unitOfMeasure)}" readonly></label><label>Cantidad recibida<input name="quantity" type="number" min="0.01" step="0.01" required></label><label>Fecha de recepción<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar recepción</button></form></section>` : '';
  return `<div class="intro"><h2>${section === 'purchases' ? 'Compras' : 'Almacén'}</h2><p>${section === 'purchases' ? 'Gestiona proveedores y órdenes de compra vinculadas a contratos.' : 'Controla existencia, comprometido, disponible y movimientos físicos.'}</p></div>${pendingActionsPanel()}${purchaseForm}${movementForm}${receiptForm}${section === 'warehouse' ? `<section class="panel"><div class="panel-heading"><h3>Existencias</h3><span>${state.db.inventory.length} productos</span></div><div class="table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th>Existencia</th><th>Comprometido</th><th>Disponible</th><th>Unidad</th></tr></thead><tbody>${state.db.inventory.map(item => { const product = byId(state.db.products, item.productId); return `<tr><td><strong>${product.code}</strong></td><td>${product.description}</td><td>${item.onHand}</td><td>${item.committed}</td><td>${item.available}</td><td>${unitLabel(item.unitOfMeasure)}</td></tr>`; }).join('')}</tbody></table></div></section>${warehouseExtras()}` : ''}<section class="panel"><div class="panel-heading"><h3>Órdenes de compra</h3><span>${state.db.purchaseOrders.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Orden</th><th>Proveedor</th><th>Contrato</th><th>Unidad</th><th>Cotizaciones</th><th>Total</th><th>Autorización</th></tr></thead><tbody>${state.db.purchaseOrders.map(order => `<tr><td><strong>${order.id}</strong></td><td>${order.supplierId}</td><td>${order.contractId || 'Almacén general'}</td><td>${unitLabel(order.items?.[0]?.unitOfMeasure)}</td><td>${attachmentsHtml(order.attachments)}</td><td>${money(order.total)}</td><td>${approvalControls('PURCHASE_ORDER', order)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function masterCatalogView() {
  const supplierOptions = state.db.suppliers.map(supplier => `<option value="${supplier.id}">${supplier.legalName}</option>`).join('');
  const productForm = `<section class="panel form-panel"><div class="panel-heading"><h3>Alta de producto</h3><span>Identificación y abastecimiento</span></div><form id="master-product-form" class="form-grid"><label>Código<input name="code" placeholder="MAT-001" required></label><label>Descripción<input name="description" required></label><label>Categoría<select name="category"><option value="EQUIPMENT">Equipo</option><option value="MATERIAL">Material</option><option value="TOOL">Herramienta</option></select></label><label>Marca<input name="brand"></label><label>Modelo<input name="model"></label><label>Unidad de medida<select name="unitOfMeasure" required>${currentUnitOptions().map(option => `<option value="${option.value}">${option.label}</option>`).join('')}</select></label><label>Costo<input name="cost" data-number-format="currency" inputmode="decimal" required></label><label>Stock mínimo<input name="minimumStock" type="number" min="0" step="0.01" value="0" required></label><label>Proveedor<select name="supplierId" required>${supplierOptions}</select></label><button class="primary-button" type="submit">Guardar producto</button></form></section>`;
  const supplierForm = `<section class="panel form-panel"><div class="panel-heading"><h3>Alta de proveedor</h3><span>Datos fiscales y contacto</span></div><form id="master-supplier-form" class="form-grid"><label>Razón social<input name="legalName" required></label><label>RFC<input name="taxId" required></label><label>Contacto<input name="contact" required></label><label>Teléfono<input name="phone"></label><button class="primary-button" type="submit">Guardar proveedor</button></form></section>`;
  const productList = `<section class="panel"><div class="panel-heading"><h3>Productos</h3><span>${state.db.products.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Unidad</th><th>Proveedor</th><th>Stock mínimo</th></tr></thead><tbody>${state.db.products.map(product => `<tr><td><strong>${product.code}</strong></td><td>${product.description}</td><td>${product.category}</td><td>${unitLabel(product.unitOfMeasure)}</td><td>${byId(state.db.suppliers, product.supplierId)?.legalName || 'Sin proveedor'}</td><td>${product.minimumStock || 0}</td></tr>`).join('')}</tbody></table></div></section>`;
  const supplierList = `<section class="panel"><div class="panel-heading"><h3>Proveedores</h3><span>${state.db.suppliers.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Razón social</th><th>RFC</th><th>Contacto</th><th>Teléfono</th><th>Estado</th></tr></thead><tbody>${state.db.suppliers.map(supplier => `<tr><td><strong>${supplier.legalName}</strong></td><td>${supplier.taxId}</td><td>${supplier.contact}</td><td>${supplier.phone || '-'}</td><td>${badge(supplier.status)}</td></tr>`).join('')}</tbody></table></div></section>`;
  const unitsList = `<section class="panel form-panel"><div class="panel-heading"><h3>Agregar unidad</h3><span>La nueva unidad estará disponible en Compras y Almacén</span></div><form id="master-unit-form" class="form-grid"><label>Código<input name="value" placeholder="PALLET" required></label><label>Nombre visible<input name="label" placeholder="Tarima" required></label><button class="primary-button" type="submit">Guardar unidad</button></form></section><section class="panel"><div class="panel-heading"><h3>Unidades de medida</h3><span>${currentUnitOptions().length} opciones</span></div><div class="tag-list">${currentUnitOptions().map(option => `<span class="catalog-tag">${option.label} <button type="button" class="catalog-edit-unit" data-unit-value="${option.value}">Modificar</button></span>`).join('')}</div></section>`;
  return `<div class="intro"><h2>Catálogo maestro</h2><p>Compras administra los datos base que utilizan Compras, Almacén y las demás áreas.</p></div><nav class="warehouse-tabs catalog-tabs" role="tablist" aria-label="Secciones del catálogo maestro"><button type="button" data-catalog-tab="products" aria-selected="true">Productos</button><button type="button" data-catalog-tab="suppliers" aria-selected="false">Proveedores</button><button type="button" data-catalog-tab="units" aria-selected="false">Unidades de medida</button></nav><section data-catalog-panel="products"><div class="catalog-forms">${productForm}</div>${productList}</section><section data-catalog-panel="suppliers" hidden><div class="catalog-forms">${supplierForm}</div>${supplierList}</section><section data-catalog-panel="units" hidden>${unitsList}</section>`;
}
function warehouseView() {
  const units = currentUnitOptions().map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  const orders = state.db.purchaseOrders.filter(order => ['APPROVED', 'PARTIALLY_RECEIVED'].includes(order.status));
  const firstOrderItems = orders[0]?.items || [];
  const receiptOptions = firstOrderItems.map((item, index) => { const product = byId(state.db.products, item.productId); const remaining = item.quantity - (item.receivedQuantity || 0); return remaining > 0 ? `<option value="${index}">${product?.code || item.productId} · pendiente ${remaining} ${unitLabel(item.unitOfMeasure)}</option>` : ''; }).join('');
  const movementForm = `<section class="panel form-panel"><div class="panel-heading"><h3>Registrar movimiento</h3><span>Entrada, salida, compromiso o liberación</span></div><p class="warehouse-help">Usa esta opción para ajustes, devoluciones o entradas que no provienen de una orden de compra.</p><form id="inventory-movement-form" class="form-grid"><label>Producto<select name="productId" required>${state.db.inventory.map(item => { const product = byId(state.db.products, item.productId); return `<option value="${item.productId}">${product.code} · disponible ${item.available}</option>`; }).join('')}</select></label><label>Unidad de medida<select name="unitOfMeasure" required>${units}</select></label><label>Movimiento<select name="movementType"><option value="ENTRY">Entrada</option><option value="EXIT">Salida</option><option value="COMMIT">Comprometer</option><option value="RELEASE">Liberar compromiso</option></select></label><label>Cantidad<input name="quantity" type="number" min="1" step="0.01" required></label><label>Referencia<input name="reference" placeholder="Orden, vale o documento"></label><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${state.db.projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('')}</select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar movimiento</button></form></section>`;
  const receiptForm = `<section class="panel form-panel"><div class="panel-heading"><h3>Recibir orden aprobada</h3><span>Registra la entrada física de una partida</span></div><p class="warehouse-help">Usa esta opción cuando la mercancía proviene de una orden de compra aprobada.</p><form id="inventory-receipt-form" class="form-grid"><label>Orden de compra<select name="purchaseOrderId" required>${orders.map(order => `<option value="${order.id}">${order.id} · ${order.items.filter(item => (item.receivedQuantity || 0) < item.quantity).length} partidas pendientes</option>`).join('')}</select></label><label>Partida<select name="itemIndex" required>${receiptOptions}</select></label><label>Unidad de medida<input name="unitOfMeasure" value="${unitLabel(firstOrderItems[0]?.unitOfMeasure)}" readonly></label><label>Cantidad recibida<input name="quantity" type="number" min="0.01" step="0.01" required></label><label>Fecha de recepción<input name="date" type="date" value="2026-09-08" required></label><button class="primary-button" type="submit">Registrar recepción</button></form></section>`;
  const inventoryTable = `<section class="panel"><div class="panel-heading"><h3>Existencias actuales</h3><span>${state.db.inventory.length} productos</span></div><div class="table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th>Existencia</th><th>Comprometido</th><th>Disponible</th><th>Unidad</th><th>Kardex</th></tr></thead><tbody>${state.db.inventory.map(item => { const product = byId(state.db.products, item.productId); return `<tr><td><strong>${product.code}</strong></td><td>${product.description}</td><td>${item.onHand}</td><td>${item.committed}</td><td>${item.available}</td><td>${unitLabel(item.unitOfMeasure)}</td><td><button type="button" class="action-button complete" data-kardex-product="${item.productId}">📊 Ver Kardex</button></td></tr>`; }).join('')}</tbody></table></div></section>`;
  const lowStockCount = state.db.inventory.filter(item => { const product = byId(state.db.products, item.productId); return item.available <= (product.minimumStock || 0); }).length;
  return `<div class="intro"><h2>Almacén</h2><p>Controla existencias, recepciones y movimientos físicos.</p></div><nav class="warehouse-tabs" role="tablist" aria-label="Secciones de almacén"><button type="button" data-warehouse-tab="summary" aria-selected="true">Resumen</button><button type="button" data-warehouse-tab="stock" aria-selected="false">Existencias</button><button type="button" data-warehouse-tab="receipts" aria-selected="false">Recepciones</button><button type="button" data-warehouse-tab="movements" aria-selected="false">Movimientos</button><button type="button" data-warehouse-tab="alerts" aria-selected="false">Alertas <span>${lowStockCount}</span></button></nav><section data-warehouse-panel="summary"><div class="metrics"><article class="metric"><span class="metric-label">Productos</span><strong class="metric-value">${state.db.inventory.length}</strong><div class="metric-note">Controlados en almacén</div></article><article class="metric"><span class="metric-label">Disponible</span><strong class="metric-value">${state.db.inventory.reduce((sum, item) => sum + Number(item.available || 0), 0)}</strong><div class="metric-note">Unidades disponibles</div></article><article class="metric"><span class="metric-label">Recepciones</span><strong class="metric-value">${orders.length}</strong><div class="metric-note">Órdenes pendientes</div></article><article class="metric"><span class="metric-label">Alertas</span><strong class="metric-value">${lowStockCount}</strong><div class="metric-note">Requieren atención</div></article></div></section><section data-warehouse-panel="stock" hidden>${inventoryTable}</section><section data-warehouse-panel="receipts" hidden>${receiptForm}</section><section data-warehouse-panel="movements" hidden>${movementForm}${warehouseHistory()}</section><section data-warehouse-panel="alerts" hidden>${warehouseAlerts()}</section>`;
}
function warehouseAlerts() {
  const lowStock = state.db.inventory.filter(item => { const product = byId(state.db.products, item.productId); return item.available <= (product.minimumStock || 0); });
  return `<section class="panel"><div class="panel-heading"><h3>Alertas de stock mínimo</h3><span>${lowStock.length} productos</span></div><div class="table-wrap"><table><thead><tr><th>Producto</th><th>Disponible</th><th>Mínimo</th></tr></thead><tbody>${lowStock.map(item => { const product = byId(state.db.products, item.productId); return `<tr><td>${product.description}</td><td>${item.available} ${unitLabel(item.unitOfMeasure)}</td><td>${product.minimumStock || 0}</td></tr>`; }).join('') || '<tr><td colspan="3">No hay alertas de stock mínimo.</td></tr>'}</tbody></table></div></section>`;
}
function warehouseHistory() {
  return `<section class="panel"><div class="panel-heading"><h3>Historial de movimientos</h3><span>${state.db.inventoryMovements.length} movimientos</span></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Movimiento</th><th>Cantidad</th><th>Referencia</th><th>Usuario</th></tr></thead><tbody>${state.db.inventoryMovements.slice().reverse().map(movement => `<tr><td>${movement.date}</td><td>${byId(state.db.products, movement.productId)?.description || movement.productId}</td><td>${movement.type}</td><td>${movement.quantity} ${unitLabel(movement.unitOfMeasure)}</td><td>${movement.reference || '-'}</td><td>${byId(state.db.users, movement.userId)?.name || movement.userId}</td></tr>`).join('') || '<tr><td colspan="6">Sin movimientos registrados.</td></tr>'}</tbody></table></div></section>`;
}
function warehouseExtras() {
  const lowStock = state.db.inventory.filter(item => { const product = byId(state.db.products, item.productId); return item.available <= (product.minimumStock || 0); });
  return `<section class="panel"><div class="panel-heading"><h3>Alertas de stock mínimo</h3><span>${lowStock.length} productos</span></div><div class="table-wrap"><table><thead><tr><th>Producto</th><th>Disponible</th><th>Mínimo</th></tr></thead><tbody>${lowStock.map(item => { const product = byId(state.db.products, item.productId); return `<tr><td>${product.description}</td><td>${item.available} ${unitLabel(item.unitOfMeasure)}</td><td>${product.minimumStock || 0}</td></tr>`; }).join('') || '<tr><td colspan="3">No hay alertas de stock mínimo.</td></tr>'}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Historial de movimientos</h3><span>${state.db.inventoryMovements.length} movimientos</span></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Movimiento</th><th>Cantidad</th><th>Referencia</th><th>Usuario</th></tr></thead><tbody>${state.db.inventoryMovements.slice().reverse().map(movement => `<tr><td>${movement.date}</td><td>${byId(state.db.products, movement.productId)?.description || movement.productId}</td><td>${movement.type}</td><td>${movement.quantity} ${unitLabel(movement.unitOfMeasure)}</td><td>${movement.reference || '-'}</td><td>${byId(state.db.users, movement.userId)?.name || movement.userId}</td></tr>`).join('') || '<tr><td colspan="6">Sin movimientos registrados.</td></tr>'}</tbody></table></div></section>`;
}
function reimbursementView() {
  const publicEmployee = activeEmployeeContext();
  const currentEmployeeId = publicEmployee ? publicEmployee.id : activeUser().id;
  const isReviewer = ['DIRECCION_GENERAL', 'FINANZAS'].includes(activeRole().name) && !publicEmployee;
  const requests = isReviewer ? state.db.reimbursements : state.db.reimbursements.filter(item => item.employeeId === currentEmployeeId);
  const form = `<section class="panel form-panel"><div class="panel-heading"><h3>Solicitar reembolso</h3><span>Agrega uno o varios comprobantes</span></div><form id="new-reimbursement-form"><div id="reimbursement-rows" class="reimbursement-rows"><div class="reimbursement-row" data-reimbursement-row="true">${reimbursementRowHtml()}</div></div><div class="form-actions"><button type="button" class="link-button" data-add-reimbursement>+ Agregar otro reembolso</button><button class="primary-button" type="submit">Enviar solicitud</button></div></form></section>`;
  return `<div class="intro"><button class="link-button" data-home-reimbursements>&larr; Volver al panel principal</button><h2>Reembolsos</h2><p>${isReviewer ? 'Finanzas administra y revisa las solicitudes de todos los trabajadores.' : 'Consulta tus solicitudes y envía uno o varios reembolsos.'}</p></div>${form}<section class="panel"><div class="panel-heading"><h3>${isReviewer ? 'Solicitudes pendientes' : 'Mis solicitudes'}</h3><span>${requests.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>ID trabajador</th><th>Proyecto</th><th>Fecha</th><th>Concepto</th><th>Partida</th><th>Total</th><th>Respaldos</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${requests.map(item => `<tr><td><strong>${item.id}</strong></td><td>${item.workerId || item.employeeId}</td><td>${item.projectName || item.projectId || 'Sin proyecto'}</td><td>${item.requestDate}</td><td>${item.concept}</td><td>${reimbursementCategoryLabel(item.category)}</td><td>${money(item.amount)}</td><td>${attachmentsHtml(item.attachments)}</td><td>${badge(item.status)}</td><td>${isReviewer && item.status === 'PENDING' ? `<button type="button" class="action-button complete" data-reimbursement-id="${item.id}" data-reimbursement-status="APPROVED">Aprobar</button> <button type="button" class="action-button reject" data-reimbursement-id="${item.id}" data-reimbursement-status="REJECTED">Rechazar</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="10">Sin solicitudes.</td></tr>'}</tbody></table></div></section>`;
}
function homeReimbursementSection() {
  if (['DIRECCION_GENERAL', 'COMERCIAL_CONTRATOS', 'FINANZAS'].includes(activeRole().name)) return '';
  const ownRequests = state.db.reimbursements.filter(item => item.employeeId === activeUser().id);
  return `<section class="panel home-reimbursements"><div class="panel-heading"><div><h3>Solicitar reembolso</h3><span>Disponible para cualquier trabajador</span></div><button type="button" class="primary-button" data-open-reimbursements>Solicitar</button></div><div class="detail-body"><p>Envía comprobantes de alimentos, transporte, hospedaje, equipo, material o herramienta.</p><p>Mis solicitudes: <strong>${ownRequests.length}</strong></p></div></section>`;
}
function reimbursementRowHtml() {
  const publicEmployee = activeEmployeeContext();
  const activeEmployee = publicEmployee || state.db.employees.find(employee => employee.status === 'ACTIVE') || null;
  const defaultWorkerId = activeEmployee ? (activeEmployee.workerId || activeEmployee.employeeNumber || activeEmployee.id) : '';
  const workerDisplay = activeEmployee ? `${activeEmployee.workerId || activeEmployee.employeeNumber} · ${activeEmployee.name}` : 'Sin trabajador';
  if (publicEmployee) {
    return `<div class="reimbursement-fields"><label>Trabajador<input type="text" value="${workerDisplay}" readonly></label><input type="hidden" name="employeeId" value="${activeEmployee.id}" required><input type="hidden" name="workerId" value="${defaultWorkerId}"><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${state.db.projects.filter(project => project.status !== 'COMPLETED').map(project => `<option value="${project.id}">${project.name}</option>`).join('')}</select></label><label>Proyecto manual<input name="projectName" placeholder="Si no está en catálogo"></label><label>Fecha<input name="requestDate" type="date" value="2026-09-08" required></label><label>Concepto<input name="concept" placeholder="Ej. Comida con cliente" required></label><label>Partida<select name="category" required>${reimbursementCategories.map(category => `<option value="${category.value}">${category.label}</option>`).join('')}</select></label><label>Total<input name="amount" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>Archivos de respaldo<input name="supportFiles" type="file" multiple accept=".pdf,.xml,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"></label><button type="button" class="remove-reimbursement" aria-label="Eliminar reembolso">×</button></div>`;
  }
  return `<div class="reimbursement-fields"><label>Trabajador<select name="employeeId" required>${state.db.employees.filter(employee => employee.status === 'ACTIVE').map(employee => `<option value="${employee.id}" data-worker-id="${employee.workerId || employee.employeeNumber || employee.id}" ${employee.id === (activeEmployee?.id || '') ? 'selected' : ''}>${employee.workerId || employee.employeeNumber} · ${employee.name}</option>`).join('')}</select></label><label>ID trabajador<input name="workerId" value="${defaultWorkerId}" placeholder="RH-0001" required></label><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${state.db.projects.filter(project => project.status !== 'COMPLETED').map(project => `<option value="${project.id}">${project.name}</option>`).join('')}</select></label><label>Proyecto manual<input name="projectName" placeholder="Si no está en catálogo"></label><label>Fecha<input name="requestDate" type="date" value="2026-09-08" required></label><label>Concepto<input name="concept" placeholder="Ej. Comida con cliente" required></label><label>Partida<select name="category" required>${reimbursementCategories.map(category => `<option value="${category.value}">${category.label}</option>`).join('')}</select></label><label>Total<input name="amount" data-number-format="currency" inputmode="decimal" placeholder="$0" required></label><label>Archivos de respaldo<input name="supportFiles" type="file" multiple accept=".pdf,.xml,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"></label><button type="button" class="remove-reimbursement" aria-label="Eliminar reembolso">×</button></div>`;
}
function vacationBalance(employeeId) {
  const employee = byId(state.db.employees, employeeId);
  const seniority = seniorityData(employee?.hireDate || new Date().toISOString());
  const entitled = employee?.vacationDays || seniority.vacation || 0;
  const approved = state.db.vacationRequests.filter(request => request.employeeId === employeeId && request.status === 'APPROVED').reduce((sum, request) => sum + Number(request.days || 0), 0);
  const pending = state.db.vacationRequests.filter(request => request.employeeId === employeeId && request.status === 'PENDING').reduce((sum, request) => sum + Number(request.days || 0), 0);
  return { years: seniority.years, entitled, used: approved, pending, available: Math.max(0, entitled - approved - pending) };
}
function employeeView() {
  if (state.view === 'people') return employeeAltaView();
  const form = can('employees.*') ? employeeForm() + positionCatalog() : '';
  const employees = state.db.employees.filter(employee => employee.status === 'ACTIVE');
  const employeeOptions = employees.map(employee => `<option value="${employee.id}">${employee.workerId || employee.employeeNumber} · ${employee.name}</option>`).join('');
  const hrForms = can('employees.*') ? `<div class="grid hr-forms"><section class="panel form-panel"><div class="panel-heading"><h3>Incidencia</h3><span>Falta, retardo, incapacidad u hora extra</span></div><form id="new-incident-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${employeeOptions}</select></label><label>Tipo<select name="type"><option>FALTA</option><option>RETARDO</option><option>INCAPACIDAD</option><option>HORA_EXTRA</option><option>PERMISO</option></select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><label>Días/horas<input name="days" type="number" min="0" step="0.5" value="1"></label><label>Descripción<input name="description" required></label><button class="primary-button" type="submit">Registrar incidencia</button></form></section><section class="panel form-panel"><div class="panel-heading"><h3>Vacaciones</h3><span>Solicitud pendiente de autorización</span></div><form id="new-vacation-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${employeeOptions}</select></label><label>Inicio<input name="startDate" type="date" required></label><label>Fin<input name="endDate" type="date" required></label><label>Días<input name="days" type="number" min="1" required></label><button class="primary-button" type="submit">Solicitar vacaciones</button></form></section></div><div class="grid hr-forms"><section class="panel form-panel"><div class="panel-heading"><h3>Documentos del expediente</h3><span>INE, CURP, RFC, contrato, etc.</span></div><form id="employee-document-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${employeeOptions}</select></label><label>Tipo<select name="type"><option>INE</option><option>CURP</option><option>RFC</option><option>NSS</option><option>CONTRATO_LABORAL</option><option>COMPROBANTE_DOMICILIO</option><option>OTRO</option></select></label><label>Archivos<input name="files" type="file" multiple required></label><button class="primary-button" type="submit">Cargar documentos</button></form></section><section class="panel form-panel"><div class="panel-heading"><h3>Baja / terminación</h3><span>Cambia al trabajador a inactivo</span></div><form id="employee-termination-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${employeeOptions}</select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><label>Motivo<input name="reason" required></label><button class="primary-button" type="submit">Registrar baja</button></form></section></div><section class="panel form-panel"><div class="panel-heading"><h3>Generar nómina</h3><span>Calcula sueldo por periodo e incidencias</span></div><form id="new-payroll-form" class="form-grid"><label>Periodo<select name="period"><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Quincenal</option></select></label><label>Inicio<input name="startDate" type="date" value="2026-09-01" required></label><label>Fin<input name="endDate" type="date" value="2026-09-15" required></label><button class="primary-button" type="submit">Calcular nómina</button></form></section>` : '';
  const incidents = state.db.incidents.slice(-10).reverse();
  const vacations = state.db.vacationRequests.slice().reverse();
  const vacationBalances = state.db.employees.map(employee => ({ employee, balance: vacationBalance(employee.id) }));
  const payrollRows = state.db.payroll.slice(-3).reverse().flatMap(payroll => payroll.records.map(record => `<tr><td>${payroll.period}</td><td>${byId(state.db.employees, record.employeeId)?.name || record.employeeId}</td><td>${money(record.gross)}</td><td>${record.incidents}</td><td>${money(record.net)}</td><td>${badge(record.status)}</td></tr>`));
  return `<div class="intro"><h2>Recursos humanos</h2><p>Expedientes, incidencias, vacaciones, documentos, bajas y nómina.</p></div>${form}${hrForms}<section class="panel"><div class="panel-heading"><h3>Trabajadores</h3><span>${state.db.employees.length} expedientes</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Nombre</th><th>Proyecto</th><th>Puesto</th><th>Sueldo diario</th><th>SDI IMSS</th><th>Estado</th></tr></thead><tbody>${state.db.employees.map(employee => `<tr><td><strong>${employee.workerId || employee.employeeNumber}</strong></td><td>${employee.name}</td><td>${employee.projectId || 'Sin proyecto'}</td><td>${positionLabel(employee.positionKey || employee.position)}</td><td>${money(employee.salaryDaily || 0)}</td><td>${money(employee.integratedDailySalary || 0)}</td><td>${badge(employee.status)}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Incidencias recientes</h3><span>${incidents.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Trabajador</th><th>Tipo</th><th>Fecha</th><th>Días/horas</th><th>Descripción</th></tr></thead><tbody>${incidents.map(item => `<tr><td>${byId(state.db.employees, item.employeeId)?.name || item.employeeId}</td><td>${item.type}</td><td>${item.date}</td><td>${item.days}</td><td>${item.description}</td></tr>`).join('') || '<tr><td colspan="5">Sin incidencias.</td></tr>'}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Saldo de vacaciones por trabajador</h3><span>Calculado conforme a antigüedad</span></div><div class="table-wrap"><table><thead><tr><th>Trabajador</th><th>Antigüedad</th><th>Asignados</th><th>Aprobados</th><th>Disponibles</th></tr></thead><tbody>${vacationBalances.map(item => `<tr><td>${item.employee.name}</td><td>${item.balance.years} años</td><td>${item.balance.entitled} días</td><td>${item.balance.used} días</td><td><strong>${item.balance.available} días</strong></td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Historial de vacaciones</h3><span>${vacations.length} solicitudes</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Trabajador</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${vacations.map(item => `<tr><td>${item.id}</td><td>${byId(state.db.employees, item.employeeId)?.name || item.employeeId}</td><td>${item.startDate}</td><td>${item.endDate}</td><td>${item.days}</td><td>${badge(item.status)}</td><td>${['DIRECCION_GENERAL', 'RECURSOS_HUMANOS'].includes(activeRole().name) && item.status === 'PENDING' ? `<button type="button" class="action-button complete" data-vacation-id="${item.id}" data-vacation-status="APPROVED">Aprobar</button> <button type="button" class="action-button reject" data-vacation-id="${item.id}" data-vacation-status="REJECTED">Rechazar</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="7">Sin solicitudes.</td></tr>'}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Nómina calculada</h3><span>${payrollRows.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Periodo</th><th>Trabajador</th><th>Bruto</th><th>Faltas</th><th>Neto</th><th>Estado</th></tr></thead><tbody>${payrollRows.join('') || '<tr><td colspan="6">Sin nóminas calculadas.</td></tr>'}</tbody></table></div></section>`;
}
function employeeAltaView() {
  const selected = byId(state.db.employees, state.selectedEmployeeId);
  if (selected) return employeeDetailView(selected);
  const form = can('employees.*') ? employeeForm() : '';
  return `<div class="intro"><h2>Altas y expedientes</h2><p>Registra nuevos trabajadores y consulta sus expedientes individuales.</p></div>${form}<section class="panel"><div class="panel-heading"><h3>Expedientes de trabajadores</h3><span>${state.db.employees.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Nombre</th><th>Departamento</th><th>Puesto</th><th>Ubicación</th><th>Proyecto</th><th>Estado</th></tr></thead><tbody>${state.db.employees.map(employee => `<tr><td><strong class="employee-link" data-employee-id="${employee.id}">${employee.workerId || employee.employeeNumber}</strong></td><td><span class="employee-link" data-employee-id="${employee.id}">${employee.name}</span></td><td>${departmentLabel(employee.department)}</td><td>${positionLabel(employee.positionKey || employee.position)}</td><td>${workplaceLabel(employee.workLocation)}</td><td>${employee.projectId || 'Sin proyecto'}</td><td>${badge(employee.status)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function employeeDetailView(employee) {
  if (state.editingEmployeeId === employee.id) return employeeEditView(employee);
  const vacation = vacationBalance(employee.id);
  const incidents = state.db.incidents.filter(item => item.employeeId === employee.id);
  const vacations = state.db.vacationRequests.filter(item => item.employeeId === employee.id);
  const documents = state.db.employeeDocuments.filter(item => item.employeeId === employee.id);
  return `<div class="detail-heading"><div><button class="link-button" data-clear-employee>&larr; Volver a expedientes</button> <button class="link-button" data-edit-employee="${employee.id}">Modificar datos</button><h2>${employee.name}</h2><p>${employee.workerId || employee.employeeNumber} · ${positionLabel(employee.positionKey || employee.position)} · ${badge(employee.status)}</p></div><div class="detail-total"><span>SDI IMSS</span><strong>${money(employee.integratedDailySalary || 0)}</strong></div></div><section class="panel"><div class="panel-heading"><h3>Datos laborales</h3><span>${workplaceLabel(employee.workLocation)}</span></div><div class="detail-body"><div class="employee-facts"><span><b>Departamento</b>${departmentLabel(employee.department)}</span><span><b>Proyecto</b>${employee.projectId || 'Sin proyecto'}</span><span><b>Contrato de obra</b>${employee.contractId || 'Sin contrato'}</span><span><b>Fecha de ingreso</b>${employee.hireDate || '-'}</span><span><b>Sueldo diario</b>${money(employee.salaryDaily || 0)}</span><span><b>Factor de integración</b>${employee.integrationFactor || '-'}</span></div></div></section><section class="panel"><div class="panel-heading"><h3>Datos personales</h3><span>Identificación y contacto</span></div><div class="detail-body"><div class="employee-facts"><span><b>NSS</b>${employee.nss || '-'}</span><span><b>CURP</b>${employee.curp || '-'}</span><span><b>RFC</b>${employee.rfc || '-'}</span><span><b>Fecha de nacimiento</b>${employee.birthDate || '-'}</span><span><b>Edad</b>${employee.age || '-'} años</span><span><b>Teléfono</b>${employee.phone || '-'}</span><span><b>Emergencia</b>${employee.emergencyContact || '-'} · ${employee.emergencyPhone || '-'}</span></div></div></section><section class="panel"><div class="panel-heading"><h3>Saldos e historial</h3><span>${incidents.length} incidencias · ${vacations.length} vacaciones</span></div><div class="detail-body"><p>Vacaciones asignadas: <strong>${vacation.entitled}</strong> · Aprobadas: <strong>${vacation.used}</strong> · Disponibles: <strong>${vacation.available}</strong></p><p>Documentos cargados: <strong>${documents.length}</strong></p></div></section>`;
}
function employeeEditView(employee) {
  const positions = positionOptions.map(position => `<option value="${position.value}" ${position.value === employee.positionKey ? 'selected' : ''}>${position.label}</option>`).join('');
  const projects = state.db.projects.map(project => `<option value="${project.id}" ${project.id === employee.projectId ? 'selected' : ''}>${project.name}</option>`).join('');
  const contracts = state.db.contracts.map(contract => `<option value="${contract.id}" ${contract.id === employee.contractId ? 'selected' : ''}>${contract.contractNumber || contract.id}</option>`).join('');
  return `<div class="intro"><button class="link-button" data-clear-employee>&larr; Cancelar</button><h2>Modificar expediente</h2><p>Confirma y modifica los datos necesarios antes de guardar.</p></div><section class="panel form-panel"><form id="edit-employee-form" class="form-grid"><input type="hidden" name="employeeId" value="${employee.id}"><label>ID trabajador<input value="${employee.workerId || employee.employeeNumber}" readonly></label><label>Nombre<input name="name" value="${employee.name || ''}" required></label><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${projects}</select></label><label>Contrato de obra<select name="contractId"><option value="">Sin contrato</option>${contracts}</select></label><label>Departamento<input name="department" value="${employee.department || ''}" required></label><label>Ubicación<select name="workLocation">${workplaceOptions.map(option => `<option value="${option.value}" ${option.value === employee.workLocation ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label><label>Puesto<select name="positionKey">${positions}</select></label><label>Sueldo<input name="salary" data-number-format="currency" value="$${Number(employee.salary || 0).toLocaleString('en-US')}" required></label><label>Periodicidad<select name="salaryPeriod"><option value="WEEKLY" ${employee.salaryPeriod === 'WEEKLY' ? 'selected' : ''}>Semanal</option><option value="BIWEEKLY" ${employee.salaryPeriod !== 'WEEKLY' ? 'selected' : ''}>Quincenal</option></select></label><label>Teléfono<input name="phone" value="${employee.phone || ''}"></label><label>Teléfono emergencia<input name="emergencyPhone" value="${employee.emergencyPhone || ''}"></label><label>Contacto emergencia<input name="emergencyContact" value="${employee.emergencyContact || ''}"></label><label>Banco<input name="bank" value="${employee.bank || ''}"></label><label>Cuenta<input name="account" value="${employee.account || ''}"></label><label>CLABE<input name="clabe" value="${employee.clabe || ''}"></label><label>Tarjeta<input name="card" value="${employee.card || ''}"></label><label>Estado<select name="status"><option value="ACTIVE" ${employee.status === 'ACTIVE' ? 'selected' : ''}>Activo / Reactivar</option><option value="INACTIVE" ${employee.status === 'INACTIVE' ? 'selected' : ''}>Baja / Inactivo</option></select></label><button class="primary-button" type="submit">Guardar cambios</button></form></section>`;
}
function positionCatalog() {
  const positions = state.db.positionCatalog || allDepartmentPositions;
  const selected = positions.find(position => position.value === state.selectedPositionKey);
  if (selected) return `<div class="intro"><button class="link-button" data-clear-position>&larr; Volver al catálogo</button><h2>Editar puesto</h2><p>Modifica el nombre, departamento y descripción del puesto.</p></div><section class="panel form-panel"><form id="edit-position-form" class="form-grid"><input type="hidden" name="value" value="${selected.value}"><label>Departamento<select name="department">${departmentOptions.map(department => `<option value="${department.value}" ${department.value === selected.department ? 'selected' : ''}>${department.value} · ${department.label}</option>`).join('')}</select></label><label>Nombre del puesto<input name="label" value="${selected.label}" required></label><label>Descripción<input name="description" value="${selected.description}" required></label><button class="primary-button" type="submit">Guardar puesto</button></form></section>`;
  return `<section class="panel"><div class="panel-heading"><h3>Catálogo de puestos</h3><span>${positions.length} puestos</span></div><div class="table-wrap"><table><thead><tr><th>Departamento</th><th>Puesto</th><th>Descripción</th></tr></thead><tbody>${positions.map(position => `<tr><td>${departmentLabel(position.department)}</td><td><strong class="employee-link" data-position-key="${position.value}">${position.label}</strong></td><td>${position.description}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function hrEmployeeOptions() { return state.db.employees.map(employee => `<option value="${employee.id}">${employee.workerId || employee.employeeNumber} · ${employee.name}</option>`).join(''); }
function hrChangesView() {
  const options = hrEmployeeOptions();
  return `<div class="intro"><h2>Bajas y modificaciones</h2><p>Consulta trabajadores y registra bajas laborales.</p></div><section class="panel form-panel"><div class="panel-heading"><h3>Registrar baja</h3><span>El expediente queda inactivo</span></div><form id="employee-termination-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${options}</select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><label>Motivo<input name="reason" required></label><button class="primary-button" type="submit">Registrar baja</button></form></section><section class="panel"><div class="panel-heading"><h3>Trabajadores y estado</h3><span>${state.db.employees.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Trabajador</th><th>Departamento</th><th>Puesto</th><th>Ubicación</th><th>Estado</th></tr></thead><tbody>${state.db.employees.map(employee => `<tr><td>${employee.workerId || employee.employeeNumber}</td><td><strong>${employee.name}</strong></td><td>${departmentLabel(employee.department)}</td><td>${positionLabel(employee.positionKey || employee.position)}</td><td>${workplaceLabel(employee.workLocation)}</td><td>${badge(employee.status)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function hrIncidentsView() {
  const options = hrEmployeeOptions();
  const incidents = state.db.incidents.slice().reverse();
  return `<div class="intro"><h2>Incidencias</h2><p>Registra y consulta el historial de incidencias por trabajador.</p></div><section class="panel form-panel"><form id="new-incident-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${options}</select></label><label>Tipo<select name="type"><option>FALTA</option><option>RETARDO</option><option>INCAPACIDAD</option><option>HORA_EXTRA</option><option>PERMISO</option></select></label><label>Fecha<input name="date" type="date" value="2026-09-08" required></label><label>Días/horas<input name="days" type="number" min="0" step="0.5" value="1"></label><label>Descripción<input name="description" required></label><button class="primary-button" type="submit">Registrar incidencia</button></form></section><section class="panel"><div class="panel-heading"><h3>Historial por trabajador</h3><span>${incidents.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Trabajador</th><th>Fecha</th><th>Tipo</th><th>Días/horas</th><th>Descripción</th></tr></thead><tbody>${incidents.map(item => `<tr><td>${byId(state.db.employees, item.employeeId)?.name || item.employeeId}</td><td>${item.date}</td><td>${item.type}</td><td>${item.days}</td><td>${item.description}</td></tr>`).join('') || '<tr><td colspan="5">Sin incidencias.</td></tr>'}</tbody></table></div></section>`;
}
function hrVacationsView() {
  const options = hrEmployeeOptions();
  const vacations = state.db.vacationRequests.slice().reverse();
  return `<div class="intro"><h2>Vacaciones</h2><p>Consulta saldos e historial de vacaciones por trabajador.</p></div><section class="panel form-panel"><form id="new-vacation-form" class="form-grid"><label>Trabajador<select name="employeeId" required>${options}</select></label><label>Inicio<input name="startDate" type="date" required></label><label>Fin<input name="endDate" type="date" required></label><label>Días<input name="days" type="number" min="1" required></label><button class="primary-button" type="submit">Solicitar vacaciones</button></form></section><section class="panel"><div class="panel-heading"><h3>Saldos por trabajador</h3><span>Tabla de antigüedad aplicada</span></div><div class="table-wrap"><table><thead><tr><th>Trabajador</th><th>Antigüedad</th><th>Asignados</th><th>Aprobados</th><th>Disponibles</th></tr></thead><tbody>${state.db.employees.map(employee => { const balance = vacationBalance(employee.id); return `<tr><td>${employee.name}</td><td>${balance.years} años</td><td>${balance.entitled}</td><td>${balance.used}</td><td><strong>${balance.available}</strong></td></tr>`; }).join('')}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Historial de vacaciones</h3><span>${vacations.length} solicitudes</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>Trabajador</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Estado</th></tr></thead><tbody>${vacations.map(item => `<tr><td>${item.id}</td><td>${byId(state.db.employees, item.employeeId)?.name || item.employeeId}</td><td>${item.startDate}</td><td>${item.endDate}</td><td>${item.days}</td><td>${badge(item.status)}</td></tr>`).join('') || '<tr><td colspan="6">Sin solicitudes.</td></tr>'}</tbody></table></div></section>`;
}
function employeeForm() {
  const positions = positionOptions.map(position => `<option value="${position.value}">${position.label}</option>`).join('');
  const contracts = state.db.contracts.map(contract => `<option value="${contract.id}">${contract.contractNumber || contract.id}</option>`).join('');
  const projects = state.db.projects.filter(project => project.status !== 'COMPLETED').map(project => `<option value="${project.id}">${project.name}</option>`).join('');
  return `<section class="panel form-panel"><div class="panel-heading"><h3>Nuevo expediente de trabajador</h3><span>Campos obligatorios y cálculos automáticos</span></div><form id="new-employee-form" class="employee-form"><div class="form-section"><h4>Identificación</h4><div class="form-grid"><label>ID de trabajador<input name="workerId" placeholder="OPS001" required></label><label>Nombre<input name="name" required></label><label>NSS (11 alfanuméricos)<input name="nss" maxlength="11" required></label><label>CURP (18 alfanuméricos)<input name="curp" maxlength="18" required></label><label>RFC (11 alfanuméricos)<input name="rfc" maxlength="11" required></label><label>C.P. receptor<input name="postalCode" maxlength="5" inputmode="numeric" required></label><label>Fecha de nacimiento<input name="birthDate" type="date" required></label><label>Edad<input name="age" readonly></label><label>Lugar de nacimiento<input name="birthPlace" required></label><label>Nacionalidad<input name="nationality" value="Mexicana" required></label><label>Sexo<select name="sex"><option>Femenino</option><option>Masculino</option><option>No especificado</option></select></label><label>Estado civil<select name="maritalStatus"><option>Soltero(a)</option><option>Casado(a)</option><option>Otro</option></select></label></div></div><div class="form-section"><h4>Asignación laboral</h4><div class="form-grid"><label>Proyecto<select name="projectId"><option value="">Sin proyecto</option>${projects}</select></label><label>Contrato de obra<select name="contractId"><option value="">Sin contrato</option>${contracts}</select></label><label>Departamento<input name="department" placeholder="OPERACIONES" required></label><label>Puesto<select name="positionKey">${positions}</select></label><label>Descripción del puesto<input name="positionDescription" readonly></label><label>Fecha de ingreso<input name="hireDate" type="date" value="2026-09-08" required></label><label>Sueldo<input name="salary" data-number-format="currency" inputmode="decimal" required></label><label>Periodicidad<select name="salaryPeriod"><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Quincenal</option></select></label><label>Sueldo diario<input name="salaryDaily" readonly></label><label>Factor de integración<input name="integrationFactor" readonly></label><label>Sueldo diario integrado (IMSS)<input name="integratedDailySalary" readonly></label></div></div><div class="form-section"><h4>Domicilio y contacto</h4><div class="form-grid"><label>Calle<input name="street" required></label><label>Número exterior<input name="exteriorNumber" required></label><label>Número interior<input name="interiorNumber"></label><label>Colonia<input name="neighborhood" required></label><label>Municipio/Alcaldía<input name="municipality" required></label><label>Estado<input name="state" required></label><label>Tipo sanguíneo<input name="bloodType" required></label><label>Teléfono personal<input name="phone" required></label><label>Teléfono de emergencia<input name="emergencyPhone" required></label><label>Contacto de emergencia<input name="emergencyContact" required></label><label>Parentesco<input name="emergencyRelationship" required></label></div></div><div class="form-section"><h4>Datos bancarios</h4><div class="form-grid"><label>Banco<input name="bank" required></label><label>Cuenta<input name="account" required></label><label>CLABE interbancaria<input name="clabe" maxlength="18" required></label><label>Tarjeta<input name="card" required></label></div></div><button class="primary-button" type="submit">Guardar expediente</button></form></section>`;
}
function moduleView(title, description, rows, headers) { return `<div class="intro"><h2>${title}</h2><p>${description}</p></div>${pendingActionsPanel()}<section class="panel"><div class="panel-heading"><h3>Registros</h3><span>${rows.length} registros</span></div><div class="table-wrap"><table><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></section>`; }

function editContractView(contract) {
  const ivaSelect = `<select name="ivaType" required>${ivaOptions.map(option => `<option value="${option.value}" ${option.value === contract.ivaType ? 'selected' : ''}>${option.label}</option>`).join('')}</select>`;
  const retentionRows = (contract.retentionRates || []).map(retention => `<div class="retention-row" data-retention-row="true"><input name="retentionConcept" value="${retentionConcept(retention)}" required><select name="retentionMode"><option value="PERCENTAGE" ${retentionMode(retention) === 'PERCENTAGE' ? 'selected' : ''}>%</option><option value="AMOUNT" ${retentionMode(retention) === 'AMOUNT' ? 'selected' : ''}>$</option></select><input name="retentionValue" data-number-format="${retentionMode(retention) === 'AMOUNT' ? 'currency' : 'percentage'}" inputmode="decimal" value="${retentionMode(retention) === 'AMOUNT' ? `$${retentionValue(retention).toLocaleString('en-US')}` : `${retentionRate(retention) * 100}%`}" required><button type="button" class="remove-retention" aria-label="Eliminar retención">×</button></div>`).join('');
  return `<div class="intro"><button class="link-button" data-clear-contract>&larr; Cancelar edición</button><h2>Editar contrato</h2><p>Solo se pueden editar contratos en borrador o en revisión. Al guardar, conservará su estado de autorización actual.</p></div><section class="panel form-panel"><form id="edit-contract-form" class="form-grid"><input type="hidden" name="contractId" value="${contract.id}"><label>Número de contrato<input name="contractNumber" value="${contract.contractNumber || contract.id}" required></label><label>Nombre del contrato<input name="contractName" value="${contract.contractName || ''}" required></label><label>Cliente<select name="clientId" required>${state.db.clients.map(client => `<option value="${client.id}" ${client.id === contract.clientId ? 'selected' : ''}>${client.tradeName}</option>`).join('')}</select></label><label>Subtotal<input name="amount" data-number-format="currency" inputmode="decimal" value="$${Number(contract.originalAmount).toLocaleString('en-US')}" required></label><label>IVA${ivaSelect}</label><div class="advance-fields"><label>Tipo de anticipo<select name="advanceMode"><option value="PERCENTAGE" ${contract.advanceMode !== 'AMOUNT' ? 'selected' : ''}>Porcentaje</option><option value="AMOUNT" ${contract.advanceMode === 'AMOUNT' ? 'selected' : ''}>Importe</option></select></label><label>Valor<input name="advanceValue" data-number-format="${contract.advanceMode === 'AMOUNT' ? 'currency' : 'percentage'}" inputmode="decimal" value="${contract.advanceMode === 'AMOUNT' ? `$${Number(contract.advanceAmount || 0).toLocaleString('en-US')}` : `${((contract.advancePercentage || 0) * 100).toFixed(2)}%`}"></label></div><div class="retention-fields"><span>Retenciones</span><div id="edit-contract-retentions" class="retention-list">${retentionRows}</div><button type="button" class="link-button add-retention" data-add-retention="edit-contract-retentions">+ Agregar retención</button></div><label>Fecha de termino<input name="endDate" type="date" value="${contract.endDate || ''}" required></label><button class="primary-button" type="submit">Guardar cambios</button></form></section>`;
}

function bindTableSearches() {
  document.querySelectorAll('.panel').forEach(panel => {
    const table = panel.querySelector('.table-wrap table');
    const heading = panel.querySelector('.panel-heading');
    if (!table || !heading || heading.querySelector('.table-search-wrap')) return;
    const searchWrap = document.createElement('div');
    searchWrap.className = 'table-search-wrap';
    searchWrap.innerHTML = `<input type="search" class="table-search-input" placeholder="🔍 Filtrar tabla..." aria-label="Filtrar tabla">`;
    const searchInput = searchWrap.querySelector('input');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
    heading.appendChild(searchWrap);
  });
}

function bindWarehouseKardex() {
  document.querySelectorAll('[data-kardex-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.kardexProduct;
      const product = byId(state.db.products, productId);
      const inventory = byId(state.db.inventory, productId);
      if (!product || !inventory) return;
      const movements = state.db.inventoryMovements.filter(m => m.productId === productId);
      let modal = document.querySelector('#kardex-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kardex-modal';
        modal.className = 'custom-modal-backdrop';
        document.body.appendChild(modal);
      }
      modal.hidden = false;
      modal.innerHTML = `
        <div class="custom-modal-card">
          <div class="custom-modal-header">
            <div>
              <p class="public-kicker">KARDEX DE ALMACÉN</p>
              <h3>${product.code} · ${product.description}</h3>
              <p style="margin:4px 0 0; color:var(--muted); font-size:12px">Categoría: ${product.category} · Unidad: ${unitLabel(inventory.unitOfMeasure)}</p>
            </div>
            <button type="button" class="custom-modal-close" id="close-kardex">&times;</button>
          </div>
          <div class="metrics" style="margin-bottom:18px">
            <article class="metric"><span class="metric-label">Existencia Física</span><strong class="metric-value">${inventory.onHand}</strong><div class="metric-note">En almacén</div></article>
            <article class="metric"><span class="metric-label">Comprometido</span><strong class="metric-value">${inventory.committed}</strong><div class="metric-note">Para proyectos</div></article>
            <article class="metric"><span class="metric-label">Disponible</span><strong class="metric-value">${inventory.available}</strong><div class="metric-note">Para despacho</div></article>
            <article class="metric"><span class="metric-label">Costo Unitario</span><strong class="metric-value">${money(product.cost || 0)}</strong><div class="metric-note">Catálogo</div></article>
          </div>
          <section class="panel">
            <div class="panel-heading"><h4>Historial de movimientos específicos</h4><span>${movements.length} registros</span></div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Referencia</th><th>Usuario</th></tr></thead>
                <tbody>${movements.slice().reverse().map(m => `<tr><td>${m.date}</td><td>${badge(m.type)}</td><td>${m.quantity} ${unitLabel(m.unitOfMeasure)}</td><td>${m.reference || '-'}</td><td>${byId(state.db.users, m.userId)?.name || m.userId}</td></tr>`).join('') || '<tr><td colspan="5">Sin movimientos registrados para este producto.</td></tr>'}</tbody>
              </table>
            </div>
          </section>
        </div>`;
      modal.querySelector('#close-kardex')?.addEventListener('click', () => { modal.hidden = true; });
      modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
    });
  });
}

function contractDetail(contract) {
  const client = byId(state.db.clients, contract.clientId);
  const project = byId(state.db.projects, contract.projectId);
  const changes = state.db.changeOrders.filter(item => item.contractId === contract.id);
  const currentFiscal = fiscalAmounts(contract.originalAmount || contract.updatedAmount, contract.ivaType, contract.advanceMode || 'AMOUNT', contract.advanceMode === 'PERCENTAGE' ? (contract.advanceValue || 0) : (contract.advanceAmount || 0), contract.retentionRates || []);
  const invoices = state.db.invoices.filter(item => item.contractId === contract.id);
  const payments = state.db.payments.filter(item => item.contractId === contract.id);
  const purchases = state.db.purchaseOrders.filter(item => item.contractId === contract.id);
  const employees = state.db.employees.filter(item => item.assignedContractIds.includes(contract.id));
  const history = state.db.approvalHistory.filter(item => item.recordId === contract.id || changes.some(change => change.id === item.recordId));
  const editButton = ['DRAFT', 'IN_REVIEW'].includes(contract.approvalStatus) && can('contracts.update') ? `<button class="link-button" data-edit-contract="${contract.id}">Editar contrato</button>` : '';
  const printButton = `<button type="button" class="action-button complete" style="margin-left:8px" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>`;
  return `<div class="contract-detail"><div class="detail-heading"><div><button class="link-button" data-clear-contract>&larr; Volver a contratos</button> ${editButton} ${printButton}<h2>${contract.contractNumber || contract.id}</h2><p>${contract.contractName || 'Contrato sin nombre'} · ${client.tradeName} · ${badge(contract.status)} · ${approvalControls('CONTRACT', contract)}</p></div><div class="detail-total"><span>Importe actualizado</span><strong>${money(contract.updatedAmount)}</strong></div></div>
    <div class="metrics">${metric('Subtotal original', money(contract.originalSubtotal || contract.originalAmount), 'Base antes de IVA')}${metric('IVA', `${ivaLabel(contract.ivaType)} · ${money(currentFiscal.ivaAmount)}`, 'Impuesto configurado')}${metric('Anticipo', money(currentFiscal.advanceAmount), advanceText({ ...contract, advanceAmount: currentFiscal.advanceAmount }))}${metric('Retenciones', money(currentFiscal.retentionAmount), retentionText(contract.retentionRates || []))}</div>
    <section class="panel fiscal-summary"><div class="panel-heading"><h3>Resumen fiscal del contrato</h3><span>Neto después de retenciones</span></div><div class="fiscal-row"><span>Subtotal actualizado</span><strong>${money(contract.updatedAmount)}</strong></div><div class="fiscal-row"><span>IVA aplicable</span><strong>${ivaLabel(contract.ivaType)} · ${money(contract.updatedAmount * currentFiscal.ivaRate)}</strong></div><div class="fiscal-row"><span>Anticipo registrado (${contract.advanceMode === 'AMOUNT' ? 'importe' : 'porcentaje'})</span><strong>${money(currentFiscal.advanceAmount)}</strong></div><div class="fiscal-row"><span>Retenciones (${retentionText(contract.retentionRates || [])})</span><strong>${money(currentFiscal.retentionAmount)}</strong></div><div class="fiscal-row total"><span>Neto estimado</span><strong>${money(contract.updatedAmount + (contract.updatedAmount * currentFiscal.ivaRate) - currentFiscal.retentionAmount)}</strong></div></section>
    <div class="grid"><section class="panel"><div class="panel-heading"><h3>Proyecto relacionado</h3><span>${project ? `${project.progressPercent}% de avance` : 'Pendiente de asignar'}</span></div><div class="detail-body">${project ? `<strong>${project.name}</strong><p>${project.nextMilestone}</p><span>Responsable: ${byId(state.db.employees, project.managerEmployeeId).name}</span>` : '<span>Este contrato todavía no tiene un proyecto relacionado.</span>'}</div></section><section class="panel"><div class="panel-heading"><h3>Ordenes de cambio</h3><span>${changes.length} registros</span></div><div class="table-wrap"><table><thead><tr><th>Orden</th><th>Subtotal</th><th>IVA</th><th>Retenciones</th><th>Neto</th><th>Autorización</th></tr></thead><tbody>${changes.map(item => `<tr><td><strong>${item.id}</strong><br><small>${item.description}</small></td><td>${money(item.subtotal ?? item.amount)}</td><td>${ivaLabel(item.ivaType)} · ${money(item.ivaAmount || 0)}</td><td>${money(item.retentionAmount || 0)}<br><small>${retentionText(item.retentionRates || [])}</small></td><td>${money(item.netAmount ?? item.amount)}</td><td>${approvalControls('CHANGE_ORDER', item)}</td></tr>`).join('')}</tbody></table></div></section></div>
    <div class="grid"><section class="panel"><div class="panel-heading"><h3>Facturacion y pagos</h3><span>${invoices.length} facturas · ${payments.length} pagos</span></div><div class="table-wrap"><table><thead><tr><th>Folio</th><th>UUID</th><th>Total</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>${invoices.map(item => `<tr><td>${item.folio || item.id}</td><td><small>${item.uuid}</small></td><td>${money(item.total)}</td><td>${money(item.balance)}</td><td>${badge(item.status)}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-heading"><h3>Compras vinculadas</h3><span>${purchases.length} ordenes</span></div><div class="table-wrap"><table><tbody>${purchases.map(item => `<tr><td>${item.id}</td><td>${item.supplierId}</td><td>${money(item.total)}</td><td>${badge(item.status)}</td></tr>`).join('')}</tbody></table></div></section></div>
    <section class="panel"><div class="panel-heading"><h3>Personal asignado</h3><span>${employees.length} personas</span></div><div class="detail-body">${employees.map(item => `<span class="person-chip"><strong>${item.name}</strong> · ${item.position}</span>`).join('')}</div></section>
    <section class="panel"><div class="panel-heading"><h3>Archivos de respaldo del contrato</h3><span>${contract.attachments?.length || 0} archivos</span></div><div class="detail-body">${attachmentsHtml(contract.attachments)}</div></section>
    <section class="panel"><div class="panel-heading"><h3>Archivos por orden de cambio</h3><span>${changes.reduce((total, change) => total + (change.attachments?.length || 0), 0)} archivos</span></div><div class="detail-body">${changes.map(change => `<div class="change-attachments"><strong>${change.id}</strong>${attachmentsHtml(change.attachments)}</div>`).join('') || '<p class="empty-note">Sin órdenes de cambio.</p>'}</div></section>
    <section class="panel"><div class="panel-heading"><h3>Historial de autorización</h3><span>${history.length} movimientos</span></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Registro</th><th>Estado</th><th>Usuario</th></tr></thead><tbody>${history.map(item => `<tr><td>${new Date(item.date).toLocaleString('es-MX')}</td><td>${item.recordId}</td><td>${badge(item.status)}</td><td>${byId(state.db.users, item.userId)?.name || item.userId}</td></tr>`).join('') || '<tr><td colspan="4">Sin movimientos de autorización.</td></tr>'}</tbody></table></div></section></div>`;
}

start().catch(error => { document.querySelector('#content').innerHTML = `<div class="panel" style="padding:24px"><h2>No se pudo cargar db.json</h2><p>${error.message}</p></div>`; });
