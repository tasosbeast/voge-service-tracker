const SERVICES = [
  {
    title: "1,000 km service",
    km: 1000,
    tasks: [
      "Change engine oil",
      "Replace oil filter",
      "Inspect and lubricate drive chain",
      "Check battery and electrical system",
      "Inspect brakes",
      "Check wheels and tires",
      "Tighten bolts and fasteners",
      "Inspect steering system",
    ],
  },
  {
    title: "4,000 km service",
    km: 4000,
    tasks: [
      "Change engine oil",
      "Replace oil filter",
      "Check throttle operation",
      "Inspect/adjust cam chain",
      "Inspect fuel system",
      "Check/adjust clutch",
      "Inspect and lubricate drive chain",
      "Clean air filter",
      "Check battery and electrical system",
      "Inspect brakes",
      "Check wheels and tires",
      "Tighten bolts and fasteners",
      "Inspect steering system",
    ],
  },
  {
    title: "8,000 km service",
    km: 8000,
    tasks: [
      "Change engine oil",
      "Replace oil filter",
      "Check throttle operation",
      "Inspect/adjust cam chain",
      "Inspect fuel system",
      "Check/adjust clutch",
      "Inspect and lubricate drive chain",
      "Replace air filter",
      "Check battery and electrical system",
      "Inspect brakes",
      "Check wheels and tires",
      "Tighten bolts and fasteners",
      "Inspect steering system",
    ],
  },
  {
    title: "12,000 km service",
    km: 12000,
    tasks: [
      "Change engine oil",
      "Replace oil filter",
      "Replace spark plug",
      "Check/adjust valve clearance",
      "Inspect/adjust cam chain",
      "Inspect fuel system",
      "Replace fuel filter",
      "Run diagnostic check on throttle body / fuel injection system",
      "Check/adjust clutch",
      "Inspect and lubricate drive chain",
      "Clean air filter",
      "Check battery and electrical system",
      "Inspect brakes",
      "Check wheels and tires",
      "Tighten bolts and fasteners",
      "Inspect steering system",
    ],
  },
];
const OFF_ROAD_CHECKS = [
  {
    id: "chain-slack",
    task: "Check chain slack",
  },
  {
    id: "coolant-level",
    task: "Check G40 coolant level",
  },
  {
    id: "wheel-spokes",
    task: "Inspect wheel spokes",
  },
  {
    id: "air-filter",
    task: "Clean air filter",
  },
  {
    id: "brakes",
    task: "Inspect brakes for mud or stones",
  },
  {
    id: "tires",
    task: "Check tires for cuts or low pressure",
  },
];
const STORAGE_KEY = "bikeData";
const updateServiceButton = document.querySelector("#update-btn");
const offRoadCheckButton = document.querySelector("#off-road-check-btn");
const offRoadDialog = document.querySelector("#off-road-dialog");
const closeOffRoadDialogButton = document.querySelector("#close-off-road-dialog");
const offRoadChecklist = document.querySelector("#off-road-checklist");
const offRoadSuccess = document.querySelector("#off-road-success");
const kmInput = document.querySelector("#km-input");
const remainingKmElement = document.querySelector("#remaining-km");
const nextServiceText = document.querySelector("#next-service");
const serviceTasks = document.querySelector("#service-tasks");
const tasksTitle = document.querySelector("#tasks-title");

renderOffRoadChecks();
loadBikeData();

updateServiceButton.addEventListener("click", handleServiceUpdate);

offRoadCheckButton.addEventListener("click", () => {
  offRoadSuccess.textContent = "";
  offRoadDialog.showModal();
});

closeOffRoadDialogButton.addEventListener("click", () => {
  offRoadDialog.close();
});

offRoadDialog.addEventListener("close", resetOffRoadChecks);

offRoadChecklist.addEventListener("change", (event) => {
  if (!event.target.matches('input[type="checkbox"]')) {
    return;
  }

  if (areAllOffRoadChecksComplete()) {
    offRoadSuccess.textContent = "Off-road check completed.";

    setTimeout(() => {
      offRoadDialog.close();
    }, 800);
  }
});

kmInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleServiceUpdate();
  }
});

function handleServiceUpdate() {
  const currentKm = Number(kmInput.value);

  if (currentKm <= 0 || Number.isNaN(currentKm)) {
    remainingKmElement.textContent = `Enter current km`;
    clearServiceUI();
  } else {
    updateServiceStatus(currentKm);
    saveBikeData(currentKm);
  }
}

function saveBikeData(currentKm) {
  const bikeData = {
    bike: "Voge 300 Rally",
    currentKm,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikeData));
}

function renderOffRoadChecks() {
  offRoadChecklist.textContent = "";

  OFF_ROAD_CHECKS.forEach((check) => {
    const checkItem = document.createElement("li");
    const checkLabel = document.createElement("label");
    const checkbox = document.createElement("input");
    const checkText = document.createElement("span");

    checkbox.type = "checkbox";
    checkbox.id = check.id;
    checkText.textContent = check.task;

    checkLabel.append(checkbox, checkText);
    checkItem.append(checkLabel);
    offRoadChecklist.append(checkItem);
  });
}

function resetOffRoadChecks() {
  offRoadChecklist.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
}

function areAllOffRoadChecksComplete() {
  const checkboxes = offRoadChecklist.querySelectorAll('input[type="checkbox"]');

  return [...checkboxes].every((checkbox) => checkbox.checked);
}

function loadBikeData() {
  const savedBikeData = localStorage.getItem(STORAGE_KEY);

  if (savedBikeData !== null) {
    try {
      const parsedBikeData = JSON.parse(savedBikeData);
      const savedKm = parsedBikeData.currentKm;
      if (
        typeof savedKm !== "number" ||
        Number.isNaN(savedKm) ||
        savedKm <= 0
      ) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        kmInput.value = savedKm;
        updateServiceStatus(savedKm);
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function updateServiceStatus(currentKm) {
  const nextService = SERVICES.find((service) => service.km >= currentKm);

  if (nextService === undefined) {
    remainingKmElement.textContent = `No upcoming service found`;
    clearServiceUI();
    return;
  }

  const { title, km, tasks } = nextService;

  const remaining = km - currentKm;
  if (remaining === 0) {
    remainingKmElement.textContent = `Service due now`;
    setRemainingKmStatus("due");
  } else {
    remainingKmElement.textContent = `Remaining: ${remaining} km`;
    setRemainingKmStatus(remaining <= 1000 ? "warning" : "normal");
  }

  nextServiceText.textContent = `Next service: ${km} km`;

  serviceTasks.textContent = "";

  tasks.forEach((task) => {
    const taskEl = document.createElement("li");
    taskEl.textContent = task;
    serviceTasks.append(taskEl);
  });

  tasksTitle.textContent = title;
}

function clearServiceUI() {
  nextServiceText.textContent = "";
  serviceTasks.textContent = "";
  tasksTitle.textContent = "";
  remainingKmElement.classList.remove("normal", "warning", "due");
}

function setRemainingKmStatus(status) {
  remainingKmElement.classList.remove("normal", "warning", "due");
  remainingKmElement.classList.add(status);
}
