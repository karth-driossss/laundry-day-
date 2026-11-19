// Initial Mock Data for Demonstration
const STAGES = ["Received", "Washing", "Drying & Ironing", "Ready for Pickup"];

let batches = [
  {
    id: "BCH-101",
    studentName: "Rohan Verma",
    room: "Block A - 112",
    tag: "Blue Tag #104",
    items: { shirts: 4, pants: 2, others: 1 },
    stageIndex: 2,
    timestamp: "Today, 09:30 AM"
  },
  {
    id: "BCH-102",
    studentName: "Ananya Singh",
    room: "Block C - 305",
    tag: "Green Tag #209",
    items: { shirts: 3, pants: 1, others: 2 },
    stageIndex: 3,
    timestamp: "Yesterday, 04:15 PM"
  }
];

let disputes = [
  {
    id: "DSP-01",
    batchId: "BCH-102",
    studentName: "Ananya Singh",
    issue: "Missing Item",
    notes: "1 White Cotton Dupatta missing from returned bag",
    status: "Open"
  }
];

// DOM Elements
const btnStudentView = document.getElementById("btn-student-view");
const btnStaffView = document.getElementById("btn-staff-view");
const studentView = document.getElementById("student-view");
const staffView = document.getElementById("staff-view");

const dropoffForm = document.getElementById("dropoff-form");
const disputeForm = document.getElementById("dispute-form");
const disputeBatchSelect = document.getElementById("dispute-batch-id");

// Role Switching Logic
btnStudentView.addEventListener("click", () => {
  btnStudentView.classList.add("active");
  btnStaffView.classList.remove("active");
  studentView.classList.add("active");
  staffView.classList.remove("active");
});

btnStaffView.addEventListener("click", () => {
  btnStaffView.classList.add("active");
  btnStudentView.classList.remove("active");
  staffView.classList.add("active");
  studentView.classList.remove("active");
});

// Handle New Drop-off Submission
dropoffForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentName = document.getElementById("student-name").value.trim();
  const room = document.getElementById("hostel-block").value.trim();
  const tag = document.getElementById("bag-tag").value;
  const shirts = parseInt(document.getElementById("shirts-count").value) || 0;
  const pants = parseInt(document.getElementById("pants-count").value) || 0;
  const others = parseInt(document.getElementById("others-count").value) || 0;

  if (shirts + pants + others === 0) {
    alert("Please add at least 1 clothing item.");
    return;
  }

  const newBatch = {
    id: "BCH-" + (100 + batches.length + 1),
    studentName,
    room,
    tag,
    items: { shirts, pants, others },
    stageIndex: 0,
    timestamp: "Just now"
  };

  batches.unshift(newBatch);
  dropoffForm.reset();
  renderAll();
});

// Handle Dispute Submission
disputeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const batchId = disputeBatchSelect.value;
  const issue = document.getElementById("dispute-issue").value;
  const notes = document.getElementById("dispute-notes").value.trim();
  const linkedBatch = batches.find((b) => b.id === batchId);

  const newDispute = {
    id: "DSP-0" + (disputes.length + 1),
    batchId,
    studentName: linkedBatch ? linkedBatch.studentName : "Student",
    issue,
    notes,
    status: "Open"
  };

  disputes.unshift(newDispute);
  disputeForm.reset();
  renderAll();
  alert("Dispute logged and linked to receipt " + batchId);
});

// Advance Batch Stage (Staff Action)
window.advanceStage = function (batchId) {
  const batch = batches.find((b) => b.id === batchId);
  if (batch && batch.stageIndex < STAGES.length - 1) {
    batch.stageIndex++;
    renderAll();
  }
};

// Resolve Dispute (Warden/Staff Action)
window.resolveDispute = function (disputeId) {
  const dispute = disputes.find((d) => d.id === disputeId);
  if (dispute) {
    dispute.status = "Resolved";
    renderAll();
  }
};

// Helper: Get Badge Class
function getStageBadgeClass(index) {
  if (index === 0) return "badge-received";
  if (index === 1) return "badge-washing";
  if (index === 2) return "badge-drying";
  return "badge-ready";
}

// Render Everything
function renderAll() {
  const studentList = document.getElementById("student-batches-list");
  const staffList = document.getElementById("staff-batches-list");
  const staffDisputeList = document.getElementById("staff-disputes-list");

  studentList.innerHTML = "";
  staffList.innerHTML = "";
  staffDisputeList.innerHTML = "";
  disputeBatchSelect.innerHTML = "";

  // Render Batches
  batches.forEach((batch) => {
    const totalItems = batch.items.shirts + batch.items.pants + batch.items.others;
    const currentStage = STAGES[batch.stageIndex];
    const badgeClass = getStageBadgeClass(batch.stageIndex);

    // Populate Dispute Select Dropdown
    const option = document.createElement("option");
    option.value = batch.id;
    option.textContent = `${batch.id} (${batch.studentName} - ${totalItems} items)`;
    disputeBatchSelect.appendChild(option);

    // Build Progress Steps HTML
    const stepsHtml = STAGES.map((stage, idx) => {
      const activeClass = idx <= batch.stageIndex ? "completed" : "";
      return `<div class="step ${activeClass}">${stage}</div>`;
    }).join("");

    // Student View Card
    studentList.innerHTML += `
      <div class="batch-item">
        <div class="batch-header">
          <span class="batch-id">${batch.id} • ${batch.tag}</span>
          <span class="badge ${badgeClass}">${currentStage}</span>
        </div>
        <div class="batch-meta">
          <strong>${batch.studentName}</strong> (${batch.room}) • Dropped: ${batch.timestamp}<br/>
          Receipt: ${batch.items.shirts} Shirts, ${batch.items.pants} Pants, ${batch.items.others} Other (Total: ${totalItems})
        </div>
        <div class="progress-steps">${stepsHtml}</div>
      </div>
    `;

    // Staff View Card
    const isComplete = batch.stageIndex === STAGES.length - 1;
    const nextStageLabel = isComplete ? "Cycle Completed" : `Move to: ${STAGES[batch.stageIndex + 1]}`;

    staffList.innerHTML += `
      <div class="batch-item">
        <div class="batch-header">
          <span class="batch-id">${batch.id} • ${batch.tag}</span>
          <span class="badge ${badgeClass}">${currentStage}</span>
        </div>
        <div class="batch-meta">
          ${batch.studentName} (${batch.room}) • <strong>${totalItems} items</strong>
        </div>
        <div class="staff-actions">
          <button class="btn-step" onclick="advanceStage('${batch.id}')" ${isComplete ? "disabled style='opacity:0.5;cursor:default'" : ""}>
            ${nextStageLabel}
          </button>
        </div>
      </div>
    `;
  });

  // Render Disputes
  disputes.forEach((dispute) => {
    const statusBadge = dispute.status === "Open" ? "badge-open" : "badge-resolved";
    staffDisputeList.innerHTML += `
      <div class="batch-item">
        <div class="batch-header">
          <span class="batch-id">${dispute.id} (Receipt: ${dispute.batchId})</span>
          <span class="badge ${statusBadge}">${dispute.status}</span>
        </div>
        <div class="batch-meta">
          <strong>${dispute.studentName}</strong> • Issue: <strong>${dispute.issue}</strong><br/>
          Note: "${dispute.notes}"
        </div>
        ${
          dispute.status === "Open"
            ? `<button class="btn-resolve" onclick="resolveDispute('${dispute.id}')">Mark as Verified & Resolved</button>`
            : ""
        }
      </div>
    `;
  });

  // Update Staff Dashboard Counters
  document.getElementById("stat-total-bags").textContent = batches.length;
  document.getElementById("stat-ready-bags").textContent = batches.filter((b) => b.stageIndex === 3).length;
  document.getElementById("stat-open-disputes").textContent = disputes.filter((d) => d.status === "Open").length;
}

// Initial Render
renderAll();
