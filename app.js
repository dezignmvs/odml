/**
 * Odamala Mahallu Census 2026 - Survey Logic (Vanilla JS)
 */

const firebaseConfig = {
  apiKey: "AIzaSyC7aFZ8KBiSsKSiH7wXJoyajiXbNQetJeQ",
  authDomain: "mahall-2571a.firebaseapp.com",
  projectId: "mahall-2571a",
  storageBucket: "mahall-2571a.firebasestorage.app",
  messagingSenderId: "1005280778183",
  appId: "1:1005280778183:web:e87c0d21bbaffae2506be2",
  measurementId: "G-T71NV8DGTL"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Application State & Constants
  // ==========================================
  const STEPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let currentStepIdx = 0;
  
  const stepMeta = {
    'A': {
      title: 'Section A: Survey Information',
      desc: 'Initial details, geographical indicators, and surveyed coordinator/assistant roles.'
    },
    'B': {
      title: 'Section B: Family Information',
      desc: 'General house name, head of family, occupancy, and demographic metrics.'
    },
    'C': {
      title: 'Section C: Individual Details',
      desc: 'Biographical registry, education, profession, contact, and health details of each family member.'
    },
    'D': {
      title: 'Section D: Student Information',
      desc: 'Academic details, course of study, and career goals for household students.'
    },
    'E': {
      title: 'Section E: House Information',
      desc: 'Property details, building status, loan liability, and vehicle ownership details.'
    },
    'F': {
      title: 'Section F: Financial Assistance',
      desc: 'Welfare benefits, government schemes, and charity funding status.'
    },
    'G': {
      title: 'Section G: Expatriate Details',
      desc: 'Details of family members residing, working, or studying abroad.'
    },
    'H': {
      title: 'Section H: Remarks & Review',
      desc: 'General notes, suggestions to Mahallu committee, and registry summary.'
    },
    'I': {
      title: 'Section I: Office Use',
      desc: 'Official verification remarks and records logging.'
    }
  };

  // State structure for dynamic rows
  let members = [];
  let expatriates = [];
  let students = [];

  // ==========================================
  // 2. DOM Elements
  // ==========================================
  const form = document.getElementById('censusForm');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionDescription = document.getElementById('sectionDescription');
  const desktopStepBadge = document.getElementById('desktopStepBadge');
  const mobileStepText = document.getElementById('mobileStepText');
  const mobileProgressBar = document.getElementById('mobileProgressBar');
  
  const membersContainer = document.getElementById('membersContainer');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const addExpatriateBtn = document.getElementById('addExpatriateBtn');
  const expatriatesList = document.getElementById('expatriatesList');
  const expatriatesDetailsSection = document.getElementById('expatriateDetailsSection');
  
  const sectionBCountVal = document.getElementById('sectionBCountVal');
  const currentMembersCountVal = document.getElementById('currentMembersCountVal');
  const membersMismatchWarning = document.getElementById('membersMismatchWarning');

  // Conditional containers
  const vehicleDetailsContainer = document.getElementById('vehicleDetailsContainer');
  const assistanceSourceContainer = document.getElementById('assistanceSourceContainer');
  const assistantNameContainer = document.getElementById('assistantNameContainer');
  const detailsProvidedByNameContainer = document.getElementById('detailsProvidedByNameContainer');

  // Section D Student details selectors
  const studentsContainer = document.getElementById('studentsContainer');
  const sectionDCountVal = document.getElementById('sectionDCountVal');
  const noStudentsMessage = document.getElementById('noStudentsMessage');

  // Modal elements
  const successModal = document.getElementById('successModal');
  const successModalCard = document.getElementById('successModalCard');
  const modalHouseholdName = document.getElementById('modalHouseholdName');
  const modalRefKey = document.getElementById('modalRefKey');
  const modalTotalMembers = document.getElementById('modalTotalMembers');
  const modalTimestamp = document.getElementById('modalTimestamp');
  const downloadJsonBtn = document.getElementById('downloadJsonBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Summary fields (Step H)
  const summaryHead = document.getElementById('summaryHead');
  const summaryHouseNum = document.getElementById('summaryHouseNum');
  const summaryTotalMembers = document.getElementById('summaryTotalMembers');
  const summaryExpatriates = document.getElementById('summaryExpatriates');

  // ==========================================
  // 3. Step Navigation Setup
  // ==========================================
  
  function updateWizardIndicators() {
    const currentStep = STEPS[currentStepIdx];
    
    // Desktop Progress Update
    STEPS.forEach((step, idx) => {
      const stepItem = document.querySelector(`.step-item[data-step="${step}"]`);
      if (!stepItem) return;
      
      // Clean up previous states
      stepItem.classList.remove('step-active', 'step-completed');
      
      if (idx === currentStepIdx) {
        stepItem.classList.add('step-active');
      } else if (idx < currentStepIdx) {
        stepItem.classList.add('step-completed');
      }
    });

    // Mobile Header Update
    const meta = stepMeta[currentStep];
    mobileStepText.textContent = `Step ${currentStepIdx + 1} of ${STEPS.length}: ${meta.title.replace('Section ' + currentStep + ': ', '')}`;
    mobileProgressBar.style.width = `${((currentStepIdx + 1) / STEPS.length) * 100}%`;

    // Title Block Update
    sectionTitle.textContent = meta.title;
    sectionDescription.textContent = meta.desc;
    desktopStepBadge.textContent = `Step ${currentStepIdx + 1} of ${STEPS.length}`;

    // Navigation Buttons configuration
    if (currentStepIdx === 0) {
      prevBtn.classList.add('hidden');
      prevBtn.classList.remove('inline-flex');
    } else {
      prevBtn.classList.remove('hidden');
      prevBtn.classList.add('inline-flex');
    }

    if (currentStepIdx === STEPS.length - 1) {
      nextBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-[10px]"></i><span>Submit Survey</span>`;
      nextBtn.classList.remove('bg-zinc-900', 'hover:bg-zinc-800');
      nextBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
    } else {
      nextBtn.innerHTML = `<span>Next Section</span><i class="fa-solid fa-arrow-right text-[10px]"></i>`;
      nextBtn.classList.add('bg-zinc-900', 'hover:bg-zinc-800');
      nextBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
    }
  }

  function updateVerifiedByField() {
    const roleRadio = form.querySelector('input[name="surveyed_by_role"]:checked');
    const nameInput = document.getElementById('surveyed_by_name');
    const officeVerifiedByInput = document.getElementById('office_verified_by');
    if (officeVerifiedByInput) {
      const role = roleRadio ? roleRadio.value : 'Cluster Coordinator';
      const name = nameInput ? nameInput.value.trim() : '';
      officeVerifiedByInput.value = name ? `${role} (${name})` : role;
    }
  }

  function showStep(index) {
    // Hide all step panels
    document.querySelectorAll('.step-content').forEach(el => {
      el.classList.remove('active');
    });

    // Show selected step panel
    const currentStepId = `step-${STEPS[index]}-content`;
    const activePanel = document.getElementById(currentStepId);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    currentStepIdx = index;
    updateWizardIndicators();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Trigger dynamic students population on entering Step D
    if (STEPS[index] === 'D') {
      populateStudentsList();
    }

    // Trigger summary panel generation on reaching Step H (Remarks & review)
    if (STEPS[index] === 'H') {
      populateSummaryPreview();
    }
    
    // Trigger verifiedby updates on reaching Step I
    if (STEPS[index] === 'I') {
      updateVerifiedByField();
    }
  }

  // ==========================================
  // Section D: Dynamic Students Handling
  // ==========================================

  function renderStudentCard(memberIdx, memberName) {
    const card = document.createElement('div');
    card.className = 'student-card bg-white border border-zinc-200 rounded-2xl p-5 relative transition duration-200 hover:border-zinc-300 shadow-sm';
    card.dataset.memberIndex = memberIdx;
    
    // Retrieve previous state details if any from localStorage/state cache
    let institution = '';
    let classCourse = '';
    let careerGoal = '';
    let achievements = '';

    try {
      const storedState = JSON.parse(localStorage.getItem('odamala_census_2026_state') || '{}');
      const existingStudentData = storedState.students?.find(s => parseInt(s.memberIdx) === memberIdx) || {};
      institution = existingStudentData.institution_name || '';
      classCourse = existingStudentData.class_course || '';
      careerGoal = existingStudentData.career_goal || '';
      achievements = existingStudentData.student_achievements || '';
    } catch (e) {
      console.warn("Could not load stored student data:", e);
    }
    
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2.5">
        <h4 class="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
          <i class="fa-solid fa-graduation-cap text-brand-600 animate-pulse"></i>
          Student Profile: <span class="text-zinc-950 font-bold normal-case">${memberName}</span>
        </h4>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4.5">
        <!-- Institution Name -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Institution Name</label>
          <input type="text" name="student[${memberIdx}][institution_name]" placeholder="e.g. Govt College" value="${institution}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Class / Course -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Class / Course</label>
          <input type="text" name="student[${memberIdx}][class_course]" placeholder="e.g. Plus Two, B.Sc Physics" value="${classCourse}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Career Goal -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Career Goal</label>
          <input type="text" name="student[${memberIdx}][career_goal]" placeholder="e.g. Civil Servant, Engineer" value="${careerGoal}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Major Achievement(s) -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Major Achievement(s)</label>
          <input type="text" name="student[${memberIdx}][student_achievements]" placeholder="e.g. School Topper" value="${achievements}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>
      </div>
    `;
    
    // Bind inputs changes to auto save
    card.querySelectorAll('input').forEach(input => {
      const handler = () => {
        saveState();
      };
      input.addEventListener('change', handler);
      input.addEventListener('input', handler);
    });
    
    studentsContainer.appendChild(card);
    students.push({
      element: card,
      memberIdx: memberIdx
    });
  }

  function populateStudentsList() {
    studentsContainer.innerHTML = '';
    students = [];
    
    let studentCount = 0;
    
    members.forEach((member, currentIdx) => {
      const card = member.element;
      const nameVal = card.querySelector(`[name="member[${currentIdx}][name]"]`)?.value.trim() || `Family Member #${currentIdx + 1}`;
      
      // Check if Student is checked in profession
      const studentCbs = card.querySelectorAll(`.member-${currentIdx}-prof-checkbox`);
      const studentCb = Array.from(studentCbs).find(cb => cb.value === 'Student');
      const isStudent = studentCb ? studentCb.checked : false;
      
      if (isStudent) {
        studentCount++;
        renderStudentCard(currentIdx, nameVal);
      }
    });
    
    if (sectionDCountVal) sectionDCountVal.textContent = studentCount;
    
    if (studentCount > 0) {
      if (noStudentsMessage) noStudentsMessage.classList.add('hidden');
    } else {
      if (noStudentsMessage) noStudentsMessage.classList.remove('hidden');
    }
  }

  // ==========================================
  // 4. Form Validation Logic
  // ==========================================
  
  function applyFieldError(field, errorMsg = '') {
    field.classList.add('border-red-500', 'ring-2', 'ring-red-500/10', 'shake');
    // Remove shake class after animation completes so it can be re-applied
    setTimeout(() => field.classList.remove('shake'), 400);

    let errorLabel = field.parentElement.querySelector('.field-error-msg');
    if (!errorLabel && errorMsg) {
      errorLabel = document.createElement('span');
      errorLabel.className = 'field-error-msg text-[10px] font-semibold text-red-600 mt-1.5 uppercase tracking-wider block';
      errorLabel.innerText = errorMsg;
      field.parentElement.appendChild(errorLabel);
    }
  }

  function clearFieldError(field) {
    field.classList.remove('border-red-500', 'ring-2', 'ring-red-100', 'ring-red-500/10');
    const errorLabel = field.parentElement.querySelector('.field-error-msg');
    if (errorLabel) {
      errorLabel.remove();
    }
  }

  function validateStep(stepCode) {
    const container = document.getElementById(`step-${stepCode}-content`);
    if (!container) return true;

    // Find all inputs, selects, textareas that are visible
    const inputs = container.querySelectorAll('input, select, textarea');
    let isValid = true;
    let firstInvalidField = null;

    inputs.forEach(input => {
      // Ignore hidden or disabled elements
      const isHidden = input.offsetParent === null;
      if (isHidden || input.disabled) {
        clearFieldError(input);
        return;
      }

      let fieldValid = true;
      let errorMsg = '';

      // Standard HTML5 validation check
      if (input.hasAttribute('required')) {
        if (input.type === 'radio') {
          // Check if at least one radio in the group is checked
          const groupName = input.name;
          const groupChecked = container.querySelector(`input[name="${groupName}"]:checked`);
          if (!groupChecked) {
            fieldValid = false;
            errorMsg = 'Please select an option';
          }
        } else if (!input.value.trim()) {
          fieldValid = false;
          errorMsg = 'This field is required';
        }
      }

      // Specific types validations
      if (fieldValid && input.type === 'number') {
        const val = parseFloat(input.value);
        const min = input.hasAttribute('min') ? parseFloat(input.getAttribute('min')) : -Infinity;
        const max = input.hasAttribute('max') ? parseFloat(input.getAttribute('max')) : Infinity;
        if (!isNaN(val)) {
          if (val < min) {
            fieldValid = false;
            errorMsg = `Must be at least ${min}`;
          } else if (val > max) {
            fieldValid = false;
            errorMsg = `Cannot exceed ${max}`;
          }
        }
      }

      if (fieldValid && input.type === 'tel') {
        const phonePattern = /^[+]?[0-9\s-]{7,15}$/;
        if (input.value && !phonePattern.test(input.value.trim())) {
          fieldValid = false;
          errorMsg = 'Enter a valid phone number';
        }
      }

      if (fieldValid) {
        clearFieldError(input);
      } else {
        applyFieldError(input, errorMsg);
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = input;
        }
      }
    });

    // Custom validations per section
    if (isValid && stepCode === 'B') {
      const totalVal = document.getElementById('total_members').value.trim();
      const maleVal = document.getElementById('male_count').value.trim();
      const femaleVal = document.getElementById('female_count').value.trim();

      // Only perform validation if total, male, and female counts are all specified
      if (totalVal !== '' && maleVal !== '' && femaleVal !== '') {
        const total = parseInt(totalVal) || 0;
        const male = parseInt(maleVal) || 0;
        const female = parseInt(femaleVal) || 0;

        if (male + female !== total) {
          const maleInput = document.getElementById('male_count');
          const femaleInput = document.getElementById('female_count');
          applyFieldError(maleInput, 'Male + Female counts must equal Total Members');
          applyFieldError(femaleInput, 'Male + Female counts must equal Total Members');
          isValid = false;
          firstInvalidField = maleInput;
        }
      }
    }

    if (isValid && stepCode === 'C') {
      // Check if family members cards count matches Step B Total Count
      const expectedTotal = parseInt(document.getElementById('total_members').value) || 0;
      const actualCount = members.length;
      if (expectedTotal !== actualCount) {
        // Trigger visual shake on the members mismatched warning banner
        membersMismatchWarning.classList.add('shake');
        setTimeout(() => membersMismatchWarning.classList.remove('shake'), 400);
        
        // We still allow proceeding, but we highlight this to them. To make it strictly consistent,
        // let's require them to align it, as matching total members ensures data integrity.
        // Uncomment if you want to block navigation:
        // isValid = false;
      }
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return isValid;
  }

  // ==========================================
  // 5. Dynamic Array Handlers (Members & Expatriates)
  // ==========================================

  function renderMemberCard(idx, initialData = {}) {
    const card = document.createElement('div');
    card.className = 'member-card bg-white border border-zinc-200 rounded-2xl p-5 relative transition duration-200 hover:border-zinc-300 shadow-sm';
    card.dataset.index = idx;

    const healthData = initialData.health_status || ['Healthy'];
    const religiousOptions = ['Madrassa Student', 'Madrassa Completed', 'Hafiz', 'Faizy', 'Baqawi', 'Hudawi', 'Darimi', 'Anwari', 'Wafi', 'Saqafi', 'Moulavi', 'Other'];
    const professionOptions = [
      'Student', 'Homemaker', 'Doctor', 'Nurse', 'Pharmacist', 'Dentist', 'Teacher', 
      'Madrassa Teacher', 'Lecturer', 'Professor', 'Mudarris', 'Khatheeb', 'Muadhin', 
      'Engineer', 'Architect', 'IT Professional', 'Electrician', 'Plumber', 'Carpenter', 
      'Mechanic', 'Driver', 'Police', 'Military', 'Lawyer', 'Accountant', 'Business Owner', 
      'Government Employee', 'Private Employee', 'Farmer', 'Retired', 'Unemployed', 'Other'
    ];
    const relData = initialData.religious_education || [];
    const profData = initialData.profession || [];

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2.5">
        <h4 class="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
          Family Member #${idx + 1}
        </h4>
        <button type="button" class="remove-member-btn text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider flex items-center gap-1 transition"
          style="display: none;">
          Remove
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
        <!-- Name -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
          <input type="text" name="member[${idx}][name]" placeholder="Full Name" value="${initialData.name || ''}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Gender</label>
          <select name="member[${idx}][gender]" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.gender ? 'selected' : ''}>-- Select --</option>
            <option value="Male" ${initialData.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${initialData.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other" ${initialData.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <!-- DOB -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Date of Birth</label>
          <input type="date" name="member[${idx}][dob]" value="${initialData.dob || ''}" max="${new Date().toISOString().split('T')[0]}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Relationship -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Relationship to Head of Family</label>
          <select name="member[${idx}][relationship]" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.relationship ? 'selected' : ''}>-- Select --</option>
            <option value="Self" ${initialData.relationship === 'Self' ? 'selected' : ''}>Self (Head)</option>
            <option value="Spouse" ${initialData.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Son" ${initialData.relationship === 'Son' ? 'selected' : ''}>Son</option>
            <option value="Daughter" ${initialData.relationship === 'Daughter' ? 'selected' : ''}>Daughter</option>
            <option value="Father" ${initialData.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${initialData.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Brother" ${initialData.relationship === 'Brother' ? 'selected' : ''}>Brother</option>
            <option value="Sister" ${initialData.relationship === 'Sister' ? 'selected' : ''}>Sister</option>
            <option value="Grandfather" ${initialData.relationship === 'Grandfather' ? 'selected' : ''}>Grandfather</option>
            <option value="Grandmother" ${initialData.relationship === 'Grandmother' ? 'selected' : ''}>Grandmother</option>
            <option value="Grandson" ${initialData.relationship === 'Grandson' ? 'selected' : ''}>Grandson</option>
            <option value="Granddaughter" ${initialData.relationship === 'Granddaughter' ? 'selected' : ''}>Granddaughter</option>
            <option value="Other" ${initialData.relationship === 'Other' ? 'selected' : ''}>Other / Relative</option>
          </select>
        </div>

        <!-- Marital Status -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Marital Status</label>
          <select name="member[${idx}][marital_status]" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.marital_status ? 'selected' : ''}>-- Select --</option>
            <option value="Unmarried" ${initialData.marital_status === 'Unmarried' ? 'selected' : ''}>Unmarried</option>
            <option value="Married" ${initialData.marital_status === 'Married' ? 'selected' : ''}>Married</option>
            <option value="Divorced" ${initialData.marital_status === 'Divorced' ? 'selected' : ''}>Divorced</option>
            <option value="Widowed" ${initialData.marital_status === 'Widowed' ? 'selected' : ''}>Widowed</option>
          </select>
        </div>

        <!-- Formal Education -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Formal Education</label>
          <input type="text" name="member[${idx}][formal_education]" placeholder="e.g. SSLC, B.Tech, PG, None" value="${initialData.formal_education || ''}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Highest Achievement -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Highest Achievement (if any)</label>
          <input type="text" name="member[${idx}][highest_achievement]" placeholder="e.g. State Rank, Gold Medal" value="${initialData.highest_achievement || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Blood Group -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Blood Group</label>
          <select name="member[${idx}][blood_group]" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.blood_group ? 'selected' : ''}>-- Select Group --</option>
            <option value="A+" ${initialData.blood_group === 'A+' ? 'selected' : ''}>A+</option>
            <option value="A-" ${initialData.blood_group === 'A-' ? 'selected' : ''}>A-</option>
            <option value="B+" ${initialData.blood_group === 'B+' ? 'selected' : ''}>B+</option>
            <option value="B-" ${initialData.blood_group === 'B-' ? 'selected' : ''}>B-</option>
            <option value="O+" ${initialData.blood_group === 'O+' ? 'selected' : ''}>O+</option>
            <option value="O-" ${initialData.blood_group === 'O-' ? 'selected' : ''}>O-</option>
            <option value="AB+" ${initialData.blood_group === 'AB+' ? 'selected' : ''}>AB+</option>
            <option value="AB-" ${initialData.blood_group === 'AB-' ? 'selected' : ''}>AB-</option>
            <option value="Unknown" ${initialData.blood_group === 'Unknown' ? 'selected' : ''}>Unknown</option>
          </select>
        </div>

        <!-- Mobile -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Mobile Number</label>
          <input type="tel" name="member[${idx}][mobile]" placeholder="e.g. 9876543210" value="${initialData.mobile || ''}" required
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Religious Education Checkboxes -->
        <div class="sm:col-span-2 md:col-span-3 border-t border-zinc-100 pt-4 mt-2">
          <span class="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-wider">Religious Education (Multiple Selection)</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150">
            ${religiousOptions.map(opt => `
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" name="member[${idx}][religious_education][${opt}]" value="${opt}" ${relData.includes(opt) ? 'checked' : ''}
                  class="member-${idx}-rel-checkbox mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
                <span class="ml-2 text-xs text-zinc-700 font-medium">${opt}</span>
              </label>
            `).join('')}
          </div>
          <div class="mt-2.5 hidden" id="relOtherContainer-${idx}">
            <label class="block text-[9px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Specify Other Religious Education</label>
            <input type="text" name="member[${idx}][religious_education_other]" placeholder="Please specify religious degree" value="${initialData.religious_education_other || ''}"
              class="block w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
          </div>
        </div>

        <!-- Profession Checkboxes -->
        <div class="sm:col-span-2 md:col-span-3 border-t border-zinc-100 pt-4 mt-2">
          <span class="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-wider">Profession (Multiple Selection)</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150">
            ${professionOptions.map(opt => `
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" name="member[${idx}][profession][${opt}]" value="${opt}" ${profData.includes(opt) ? 'checked' : ''}
                  class="member-${idx}-prof-checkbox mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
                <span class="ml-2 text-xs text-zinc-700 font-medium">${opt}</span>
              </label>
            `).join('')}
          </div>
          <div class="mt-2.5 hidden" id="profOtherContainer-${idx}">
            <label class="block text-[9px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Specify Other Profession</label>
            <input type="text" name="member[${idx}][profession_other]" placeholder="Please specify profession" value="${initialData.profession_other || ''}"
              class="block w-full px-3.5 py-2 bg-white border border-zinc-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
          </div>
        </div>

        <!-- Health Status -->
        <div class="sm:col-span-2 md:col-span-3 border-t border-zinc-100 pt-4 mt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][Healthy]" value="Healthy" ${healthData.includes('Healthy') ? 'checked' : ''}
                class="member-${idx}-health-healthy mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">Healthy</span>
            </label>
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][Under Treatment]" value="Under Treatment" ${healthData.includes('Under Treatment') ? 'checked' : ''}
                class="member-${idx}-health-chronic mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">Under Treatment</span>
            </label>
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][Treatment Supported by Others]" value="Treatment Supported by Others" ${healthData.includes('Treatment Supported by Others') ? 'checked' : ''}
                class="member-${idx}-health-chronic mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">Treatment Supported by Others</span>
            </label>
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][Unable to Afford Treatment]" value="Unable to Afford Treatment" ${healthData.includes('Unable to Afford Treatment') ? 'checked' : ''}
                class="member-${idx}-health-chronic mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">Unable to Afford Treatment</span>
            </label>
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][Neglected by Relatives]" value="Neglected by Relatives" ${healthData.includes('Neglected by Relatives') ? 'checked' : ''}
                class="member-${idx}-health-chronic mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">Neglected by Relatives</span>
            </label>
            <label class="flex items-start cursor-pointer">
              <input type="checkbox" name="member[${idx}][health][No One to Provide Care]" value="No One to Provide Care" ${healthData.includes('No One to Provide Care') ? 'checked' : ''}
                class="member-${idx}-health-chronic mt-0.5 h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-600 border-zinc-300 cursor-pointer">
              <span class="ml-2 text-xs font-medium text-zinc-700">No One to Provide Care</span>
            </label>
          </div>
        </div>
      </div>
    `;

    // Bind remove button listener
    const removeBtn = card.querySelector('.remove-member-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeMember(idx);
      });
    }

    // Mutual Exclusivity for Health Checkboxes inside member card
    const healthyCb = card.querySelector(`.member-${idx}-health-healthy`);
    const chronicCbs = card.querySelectorAll(`.member-${idx}-health-chronic`);

    healthyCb.addEventListener('change', (e) => {
      if (e.target.checked) {
        chronicCbs.forEach(cb => {
          cb.checked = false;
          cb.disabled = true;
          cb.parentElement.classList.add('opacity-50', 'pointer-events-none');
        });
      } else {
        chronicCbs.forEach(cb => {
          cb.disabled = false;
          cb.parentElement.classList.remove('opacity-50', 'pointer-events-none');
        });
      }
      saveState();
    });

    chronicCbs.forEach(cb => {
      cb.addEventListener('change', () => {
        // If chronic option is selected, uncheck Healthy
        if (healthyCb.checked) {
          healthyCb.checked = false;
          // chronic Cbs should be enabled in this state
          chronicCbs.forEach(c => {
            c.disabled = false;
            c.parentElement.classList.remove('opacity-50', 'pointer-events-none');
          });
        }
        saveState();
      });
    });

    // Initial state setup on rendering
    if (healthyCb.checked) {
      chronicCbs.forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
        cb.parentElement.classList.add('opacity-50', 'pointer-events-none');
      });
    }

    // Show/hide other religious education specify input
    const relCheckboxGroup = card.querySelectorAll(`.member-${idx}-rel-checkbox`);
    const relOtherCb = Array.from(relCheckboxGroup).find(cb => cb.value === 'Other');
    const relOtherCont = card.querySelector(`#relOtherContainer-${idx}`);
    if (relOtherCb && relOtherCont) {
      const toggleRelOther = () => {
        if (relOtherCb.checked) {
          relOtherCont.classList.remove('hidden');
          relOtherCont.querySelector('input').setAttribute('required', 'true');
        } else {
          relOtherCont.classList.add('hidden');
          relOtherCont.querySelector('input').removeAttribute('required');
          relOtherCont.querySelector('input').value = '';
          clearFieldError(relOtherCont.querySelector('input'));
        }
      };
      relOtherCb.addEventListener('change', () => {
        toggleRelOther();
        saveState();
      });
      // Initial toggle
      toggleRelOther();
    }

    // Show/hide other profession specify input
    const profCheckboxGroup = card.querySelectorAll(`.member-${idx}-prof-checkbox`);
    const profOtherCb = Array.from(profCheckboxGroup).find(cb => cb.value === 'Other');
    const profOtherCont = card.querySelector(`#profOtherContainer-${idx}`);
    if (profOtherCb && profOtherCont) {
      const toggleProfOther = () => {
        if (profOtherCb.checked) {
          profOtherCont.classList.remove('hidden');
          profOtherCont.querySelector('input').setAttribute('required', 'true');
        } else {
          profOtherCont.classList.add('hidden');
          profOtherCont.querySelector('input').removeAttribute('required');
          profOtherCont.querySelector('input').value = '';
          clearFieldError(profOtherCont.querySelector('input'));
        }
      };
      profOtherCb.addEventListener('change', () => {
        toggleProfOther();
        saveState();
      });
      // Initial toggle
      toggleProfOther();
    }

    // Bind inputs changes to auto save
    card.querySelectorAll('input, select').forEach(input => {
      const handler = () => {
        saveState();
        validateMembersCountAlert();
      };
      input.addEventListener('change', handler);
      input.addEventListener('input', handler);
    });

    return card;
  }

  function addMember(initialData = {}) {
    const nextIdx = members.length;
    const cardEl = renderMemberCard(nextIdx, initialData);
    membersContainer.appendChild(cardEl);
    
    // Store in memory
    members.push({
      element: cardEl,
      id: nextIdx
    });

    // Update count displays
    validateMembersCountAlert();
    saveState();
  }

  function removeMember(idx) {
    if (members.length <= 1) return; // Prevent removing last member
    
    // Find index in members array
    const targetIdx = members.findIndex(m => m.id === idx);
    if (targetIdx !== -1) {
      // Remove element from DOM
      members[targetIdx].element.remove();
      // Remove from state array
      members.splice(targetIdx, 1);
      
      // Re-index remaining cards for consistent fields name mapping
      reindexMembers();
    }
  }

  function reindexMembers() {
    // Reset internal state ids
    members.forEach((member, currentIdx) => {
      member.id = currentIdx;
      
      const card = member.element;
      card.dataset.index = currentIdx;
      
      // Update Card Header Text
      const headerText = card.querySelector('h4');
      if (headerText) {
        headerText.innerHTML = `Family Member #${currentIdx + 1}`;
      }

      // Update Remove Button Visibility
      const removeBtn = card.querySelector('.remove-member-btn');
      if (removeBtn) {
        removeBtn.style.display = 'none';
      }

      // Update inputs names attributes
      const inputs = card.querySelectorAll('input, select');
      inputs.forEach(input => {
        const nameAttr = input.getAttribute('name');
        if (nameAttr) {
          // Replace index inside brackets e.g. member[0][name] to member[currentIdx][name]
          const updatedName = nameAttr.replace(/member\[\d+\]/, `member[${currentIdx}]`);
          input.setAttribute('name', updatedName);
        }
      });
    });

    validateMembersCountAlert();
    saveState();
  }

  function validateMembersCountAlert() {
    const expected = parseInt(document.getElementById('total_members').value) || 0;
    const current = members.length;
    
    if (sectionBCountVal) sectionBCountVal.textContent = expected || '--';
    if (currentMembersCountVal) currentMembersCountVal.textContent = current;

    if (expected > 0 && expected !== current) {
      membersMismatchWarning.classList.remove('hidden');
    } else {
      membersMismatchWarning.classList.add('hidden');
    }
  }

  function updateTotalMembersSum() {
    const totalMembersEl = document.getElementById('total_members');
    const maleCountEl = document.getElementById('male_count');
    const femaleCountEl = document.getElementById('female_count');
    if (totalMembersEl && maleCountEl && femaleCountEl) {
      const male = parseInt(maleCountEl.value) || 0;
      const female = parseInt(femaleCountEl.value) || 0;
      totalMembersEl.value = male + female;
      
      // Sync member cards with demographics
      syncMemberCardsWithDemographics();
      
      // Trigger validation alert update
      validateMembersCountAlert();
    }
  }

  function syncMemberCardsWithDemographics() {
    const maleCountEl = document.getElementById('male_count');
    const femaleCountEl = document.getElementById('female_count');
    if (!maleCountEl || !femaleCountEl) return;

    const maleCount = parseInt(maleCountEl.value) || 0;
    const femaleCount = parseInt(femaleCountEl.value) || 0;
    const totalMembers = maleCount + femaleCount;

    if (totalMembers === 0) return; // Keep existing cards or let them change later

    const currentCount = members.length;
    if (totalMembers > currentCount) {
      // Need to add cards
      const diff = totalMembers - currentCount;
      
      // Determine what genders are already defined in the existing cards
      let existingMales = 0;
      let existingFemales = 0;
      members.forEach(m => {
        const genderSelect = m.element.querySelector(`[name="member[${m.id}][gender]"]`);
        if (genderSelect) {
          if (genderSelect.value === 'Male') existingMales++;
          else if (genderSelect.value === 'Female') existingFemales++;
        }
      });

      // Calculate how many more males and females we should add to match the counts
      let neededMales = Math.max(0, maleCount - existingMales);
      let neededFemales = Math.max(0, femaleCount - existingFemales);

      for (let i = 0; i < diff; i++) {
        let gender = '';
        if (neededMales > 0) {
          gender = 'Male';
          neededMales--;
        } else if (neededFemales > 0) {
          gender = 'Female';
          neededFemales--;
        }
        addMember({ gender: gender });
      }
    } else if (totalMembers < currentCount) {
      // Need to remove cards from the end
      const diff = currentCount - totalMembers;
      for (let i = 0; i < diff; i++) {
        if (members.length <= 1) break;
        const lastMember = members[members.length - 1];
        lastMember.element.remove();
        members.pop();
      }
      reindexMembers();
    }
  }

  // ==========================================
  // Expatriate Row Handler
  // ==========================================

  function renderExpatriateCard(idx, initialData = {}) {
    const card = document.createElement('div');
    card.className = 'expatriate-card bg-white border border-zinc-200 rounded-2xl p-5 relative transition duration-200 hover:border-zinc-300 shadow-sm';
    card.dataset.index = idx;

    let contactCountryCode = '+91';
    let contactPhone = '';
    
    if (initialData.contact) {
      const contactVal = initialData.contact.trim();
      const parts = contactVal.split(' ');
      if (parts.length > 1 && parts[0].startsWith('+')) {
        contactCountryCode = parts[0];
        contactPhone = parts.slice(1).join(' ');
      } else {
        const commonCodes = ['+91', '+971', '+966', '+974', '+968', '+973', '+965', '+44', '+1'];
        let matched = false;
        for (let code of commonCodes) {
          if (contactVal.startsWith(code)) {
            contactCountryCode = code;
            contactPhone = contactVal.substring(code.length).trim();
            matched = true;
            break;
          }
        }
        if (!matched) {
          contactPhone = contactVal;
        }
      }
    }

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2.5">
        <h4 class="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
          Expatriate Profile #${idx + 1}
        </h4>
        <button type="button" class="remove-expatriate-btn text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider flex items-center gap-1 transition"
          style="${idx === 0 ? 'display: none;' : ''}">
          Remove
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4.5">
        <!-- Name -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Name</label>
          <input type="text" name="expatriate[${idx}][name]" placeholder="Full Name" value="${initialData.name || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Country -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Country</label>
          <select name="expatriate[${idx}][country]"
            class="expatriate-country-select block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.country ? 'selected' : ''}>-- Select --</option>
            <option value="India" ${initialData.country === 'India' ? 'selected' : ''}>India</option>
            <option value="UAE" ${initialData.country === 'UAE' ? 'selected' : ''}>UAE</option>
            <option value="Saudi Arabia" ${initialData.country === 'Saudi Arabia' ? 'selected' : ''}>Saudi Arabia</option>
            <option value="Qatar" ${initialData.country === 'Qatar' ? 'selected' : ''}>Qatar</option>
            <option value="Oman" ${initialData.country === 'Oman' ? 'selected' : ''}>Oman</option>
            <option value="Bahrain" ${initialData.country === 'Bahrain' ? 'selected' : ''}>Bahrain</option>
            <option value="Kuwait" ${initialData.country === 'Kuwait' ? 'selected' : ''}>Kuwait</option>
            <option value="United Kingdom" ${initialData.country === 'United Kingdom' ? 'selected' : ''}>United Kingdom</option>
            <option value="United States" ${initialData.country === 'United States' ? 'selected' : ''}>United States</option>
            <option value="Canada" ${initialData.country === 'Canada' ? 'selected' : ''}>Canada</option>
            <option value="Australia" ${initialData.country === 'Australia' ? 'selected' : ''}>Australia</option>
            <option value="Malaysia" ${initialData.country === 'Malaysia' ? 'selected' : ''}>Malaysia</option>
            <option value="Singapore" ${initialData.country === 'Singapore' ? 'selected' : ''}>Singapore</option>
            <option value="Germany" ${initialData.country === 'Germany' ? 'selected' : ''}>Germany</option>
            <option value="France" ${initialData.country === 'France' ? 'selected' : ''}>France</option>
            <option value="Italy" ${initialData.country === 'Italy' ? 'selected' : ''}>Italy</option>
            <option value="Ireland" ${initialData.country === 'Ireland' ? 'selected' : ''}>Ireland</option>
            <option value="New Zealand" ${initialData.country === 'New Zealand' ? 'selected' : ''}>New Zealand</option>
            <option value="Maldives" ${initialData.country === 'Maldives' ? 'selected' : ''}>Maldives</option>
            <option value="Yemen" ${initialData.country === 'Yemen' ? 'selected' : ''}>Yemen</option>
            <option value="Jordan" ${initialData.country === 'Jordan' ? 'selected' : ''}>Jordan</option>
            <option value="Egypt" ${initialData.country === 'Egypt' ? 'selected' : ''}>Egypt</option>
            <option value="Sudan" ${initialData.country === 'Sudan' ? 'selected' : ''}>Sudan</option>
            <option value="Nigeria" ${initialData.country === 'Nigeria' ? 'selected' : ''}>Nigeria</option>
            <option value="South Africa" ${initialData.country === 'South Africa' ? 'selected' : ''}>South Africa</option>
            <option value="Other" ${initialData.country === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Contact Number</label>
          <div class="flex flex-col gap-1.5">
            <select name="expatriate[${idx}][country_code]"
              class="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
              <option value="+91" ${contactCountryCode === '+91' ? 'selected' : ''}>IN +91</option>
              <option value="+971" ${contactCountryCode === '+971' ? 'selected' : ''}>UAE +971</option>
              <option value="+966" ${contactCountryCode === '+966' ? 'selected' : ''}>KSA +966</option>
              <option value="+974" ${contactCountryCode === '+974' ? 'selected' : ''}>QA +974</option>
              <option value="+968" ${contactCountryCode === '+968' ? 'selected' : ''}>OM +968</option>
              <option value="+973" ${contactCountryCode === '+973' ? 'selected' : ''}>BH +973</option>
              <option value="+965" ${contactCountryCode === '+965' ? 'selected' : ''}>KW +965</option>
              <option value="+44" ${contactCountryCode === '+44' ? 'selected' : ''}>UK +44</option>
              <option value="+1" ${contactCountryCode === '+1' ? 'selected' : ''}>US +1</option>
              <option value="+61" ${contactCountryCode === '+61' ? 'selected' : ''}>AUS +61</option>
              <option value="+60" ${contactCountryCode === '+60' ? 'selected' : ''}>MY +60</option>
              <option value="+65" ${contactCountryCode === '+65' ? 'selected' : ''}>SG +65</option>
              <option value="+49" ${contactCountryCode === '+49' ? 'selected' : ''}>DE +49</option>
              <option value="+33" ${contactCountryCode === '+33' ? 'selected' : ''}>FR +33</option>
              <option value="+39" ${contactCountryCode === '+39' ? 'selected' : ''}>IT +39</option>
              <option value="+353" ${contactCountryCode === '+353' ? 'selected' : ''}>IE +353</option>
              <option value="+64" ${contactCountryCode === '+64' ? 'selected' : ''}>NZ +64</option>
              <option value="+960" ${contactCountryCode === '+960' ? 'selected' : ''}>MV +960</option>
              <option value="+967" ${contactCountryCode === '+967' ? 'selected' : ''}>YE +967</option>
              <option value="+962" ${contactCountryCode === '+962' ? 'selected' : ''}>JO +962</option>
              <option value="+20" ${contactCountryCode === '+20' ? 'selected' : ''}>EG +20</option>
              <option value="+249" ${contactCountryCode === '+249' ? 'selected' : ''}>SD +249</option>
              <option value="+234" ${contactCountryCode === '+234' ? 'selected' : ''}>NG +234</option>
              <option value="+27" ${contactCountryCode === '+27' ? 'selected' : ''}>ZA +27</option>
            </select>
            <input type="tel" name="expatriate[${idx}][contact_phone]" placeholder="e.g. 501234567" value="${contactPhone}"
              class="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
          </div>
        </div>

        <!-- Profession -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Profession</label>
          <input type="text" name="expatriate[${idx}][profession]" placeholder="e.g. Driver" value="${initialData.profession || ''}"
            class="block w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>
      </div>
    `;

    // Bind remove button listener
    const removeBtn = card.querySelector('.remove-expatriate-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeExpatriate(idx);
      });
    }

    // Bind country select auto-update listener
    const countrySelect = card.querySelector('.expatriate-country-select');
    const countryCodeSelect = card.querySelector(`select[name="expatriate[${idx}][country_code]"]`);
    if (countrySelect && countryCodeSelect) {
      countrySelect.addEventListener('change', (e) => {
        const country = e.target.value;
        const mapping = {
          'India': '+91',
          'UAE': '+971',
          'Saudi Arabia': '+966',
          'Qatar': '+974',
          'Oman': '+968',
          'Bahrain': '+973',
          'Kuwait': '+965',
          'United Kingdom': '+44',
          'United States': '+1',
          'Canada': '+1',
          'Australia': '+61',
          'Malaysia': '+60',
          'Singapore': '+65',
          'Germany': '+49',
          'France': '+33',
          'Italy': '+39',
          'Ireland': '+353',
          'New Zealand': '+64',
          'Maldives': '+960',
          'Yemen': '+967',
          'Jordan': '+962',
          'Egypt': '+20',
          'Sudan': '+249',
          'Nigeria': '+234',
          'South Africa': '+27'
        };
        if (mapping[country]) {
          countryCodeSelect.value = mapping[country];
        }
        saveState();
      });
    }

    // Bind inputs changes to auto save
    card.querySelectorAll('input, select').forEach(input => {
      const handler = () => {
        saveState();
      };
      input.addEventListener('change', handler);
      input.addEventListener('input', handler);
    });

    return card;
  }

  function addExpatriate(initialData = {}) {
    const nextIdx = expatriates.length;
    const cardEl = renderExpatriateCard(nextIdx, initialData);
    expatriatesList.appendChild(cardEl);
    
    expatriates.push({
      element: cardEl,
      id: nextIdx
    });

    saveState();
  }

  function removeExpatriate(idx) {
    if (expatriates.length <= 1) return;
    
    const targetIdx = expatriates.findIndex(e => e.id === idx);
    if (targetIdx !== -1) {
      expatriates[targetIdx].element.remove();
      expatriates.splice(targetIdx, 1);
      reindexExpatriates();
    }
  }

  function reindexExpatriates() {
    expatriates.forEach((expat, currentIdx) => {
      expat.id = currentIdx;
      
      const card = expat.element;
      card.dataset.index = currentIdx;
      
      const headerText = card.querySelector('h4');
      if (headerText) {
        headerText.innerHTML = `Expatriate Profile #${currentIdx + 1}`;
      }

      const removeBtn = card.querySelector('.remove-expatriate-btn');
      if (removeBtn) {
        if (currentIdx === 0) {
          removeBtn.style.display = 'none';
        } else {
          removeBtn.style.display = 'flex';
        }
      }

      const inputs = card.querySelectorAll('input, select');
      inputs.forEach(input => {
        const nameAttr = input.getAttribute('name');
        if (nameAttr) {
          const updatedName = nameAttr.replace(/expatriate\[\d+\]/, `expatriate[${currentIdx}]`);
          input.setAttribute('name', updatedName);
        }
      });
    });

    saveState();
  }

  function toggleExpatriatesSection(hasExpat) {
    if (hasExpat === 'Yes') {
      expatriatesDetailsSection.classList.remove('hidden');
      // If list is empty, initialize with 1 card
      if (expatriates.length === 0) {
        addExpatriate();
      }
      // Enable required constraints for children
      setInputsRequired(expatriatesDetailsSection, true);
    } else {
      expatriatesDetailsSection.classList.add('hidden');
      // Remove required constraints to bypass validation
      setInputsRequired(expatriatesDetailsSection, false);
    }
  }

  function setInputsRequired(container, isRequired) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (isRequired) {
        input.setAttribute('required', 'true');
      } else {
        input.removeAttribute('required');
        clearFieldError(input);
      }
    });
  }

  // ==========================================
  // 6. Conditional Display Logic Bindings
  // ==========================================

  // Vehicle Details Toggle
  const vehicleOwnershipRadios = document.getElementsByName('vehicle_ownership');
  vehicleOwnershipRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Yes') {
        vehicleDetailsContainer.classList.remove('hidden');
        // Do not make vehicle inputs required
      } else {
        vehicleDetailsContainer.classList.add('hidden');
        setInputsRequired(vehicleDetailsContainer, false);
        // Clear value counts on disable
        vehicleDetailsContainer.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
      }
      saveState();
    });
  });

  // Financial Assistance Toggle
  const finAssistanceRadios = document.getElementsByName('financial_assistance');
  finAssistanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Yes') {
        assistanceSourceContainer.classList.remove('hidden');
        setInputsRequired(assistanceSourceContainer, true);
      } else {
        assistanceSourceContainer.classList.add('hidden');
        setInputsRequired(assistanceSourceContainer, false);
        // Clear input value
        const sourceValInput = document.getElementById('assistance_source');
        if (sourceValInput) sourceValInput.value = '';
      }
      saveState();
    });
  });

  // Expatriates Toggle
  const expatRadios = document.getElementsByName('has_expatriates');
  expatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleExpatriatesSection(e.target.value);
      saveState();
    });
  });

  // Save state on role change
  form.addEventListener('change', (e) => {
    if (e.target.name === 'surveyed_by_role') {
      saveState();
    }
  });

  // Surveyed By Role Toggle
  const surveyedByRoleRadios = document.getElementsByName('surveyed_by_role');
  const surveyedByNameInput = document.getElementById('surveyed_by_name');

  function toggleSurveyedByRoleSection(role) {
    if (!assistantNameContainer) return;
    if (role === 'Assistant') {
      assistantNameContainer.classList.remove('hidden');
      if (surveyedByNameInput) {
        surveyedByNameInput.setAttribute('required', 'true');
      }
    } else {
      assistantNameContainer.classList.add('hidden');
      if (surveyedByNameInput) {
        surveyedByNameInput.removeAttribute('required');
        surveyedByNameInput.value = '';
        clearFieldError(surveyedByNameInput);
      }
    }
  }

  surveyedByRoleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleSurveyedByRoleSection(e.target.value);
      saveState();
    });
  });

  // Details Provided By Type Toggle
  const detailsProvidedBySelect = document.getElementById('details_provided_by_type');
  const detailsProvidedByNameInput = document.getElementById('details_provided_by_name');
  
  function toggleDetailsProvidedBySection(type) {
    if (!detailsProvidedByNameContainer) return;
    if (type === 'Family Member' || type === 'Other') {
      detailsProvidedByNameContainer.classList.remove('hidden');
      if (detailsProvidedByNameInput) {
        detailsProvidedByNameInput.setAttribute('required', 'true');
      }
    } else {
      detailsProvidedByNameContainer.classList.add('hidden');
      if (detailsProvidedByNameInput) {
        detailsProvidedByNameInput.removeAttribute('required');
        detailsProvidedByNameInput.value = '';
        clearFieldError(detailsProvidedByNameInput);
      }
    }
  }

  if (detailsProvidedBySelect) {
    detailsProvidedBySelect.addEventListener('change', (e) => {
      toggleDetailsProvidedBySection(e.target.value);
      saveState();
    });
  }

  // GPS Geolocation Handler
  const detectLocationBtn = document.getElementById('detectLocationBtn');
  const gisLocationInput = document.getElementById('gis_location');
  if (detectLocationBtn && gisLocationInput) {
    detectLocationBtn.addEventListener('click', () => {
      detectLocationBtn.disabled = true;
      const originalHtml = detectLocationBtn.innerHTML;
      detectLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          gisLocationInput.value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          detectLocationBtn.disabled = false;
          detectLocationBtn.innerHTML = originalHtml;
          clearFieldError(gisLocationInput);
          saveState();
        },
        (error) => {
          console.warn('Geolocation Error:', error);
          alert('Unable to detect location. Please type details manually or allow location sharing.');
          detectLocationBtn.disabled = false;
          detectLocationBtn.innerHTML = originalHtml;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  // ==========================================
  // 7. Auto-Save & LocalStorage Logic
  // ==========================================

  function getFormState() {
    const rawData = new FormData(form);
    const data = {};

    // Standard Inputs key values mapping
    for (let [key, val] of rawData.entries()) {
      // Skip array formatted parameters that we pull explicitly
      if (key.startsWith('member[') || key.startsWith('expatriate[') || key.startsWith('student[')) {
        continue;
      }
      
      data[key] = val;
    }

    // Capture dynamic Members data
    data.members = [];
    members.forEach((m, idx) => {
      const name = form.querySelector(`[name="member[${idx}][name]"]`)?.value || '';
      const gender = form.querySelector(`[name="member[${idx}][gender]"]`)?.value || '';
      const dob = form.querySelector(`[name="member[${idx}][dob]"]`)?.value || '';
      const relationship = form.querySelector(`[name="member[${idx}][relationship]"]`)?.value || '';
      const marital_status = form.querySelector(`[name="member[${idx}][marital_status]"]`)?.value || '';
      const formal_education = form.querySelector(`[name="member[${idx}][formal_education]"]`)?.value || '';
      const highest_achievement = form.querySelector(`[name="member[${idx}][highest_achievement]"]`)?.value || '';
      const blood_group = form.querySelector(`[name="member[${idx}][blood_group]"]`)?.value || '';
      const mobile = form.querySelector(`[name="member[${idx}][mobile]"]`)?.value || '';

      // Capture health statuses for the member
      const healthStatuses = [];
      const healthInputs = form.querySelectorAll(`[name^="member[${idx}][health]"]`);
      healthInputs.forEach(input => {
        if (input.checked) {
          healthStatuses.push(input.value);
        }
      });

      // Capture religious education list (multi-select)
      const religiousEducationList = [];
      const relCbs = form.querySelectorAll(`[name^="member[${idx}][religious_education]["]`);
      relCbs.forEach(cb => {
        if (cb.checked) {
          religiousEducationList.push(cb.value);
        }
      });
      const religious_education_other = form.querySelector(`[name="member[${idx}][religious_education_other]"]`)?.value || '';

      // Capture profession list (multi-select)
      const professionList = [];
      const profCbs = form.querySelectorAll(`[name^="member[${idx}][profession]["]`);
      profCbs.forEach(cb => {
        if (cb.checked) {
          professionList.push(cb.value);
        }
      });
      const profession_other = form.querySelector(`[name="member[${idx}][profession_other]"]`)?.value || '';

      data.members.push({ 
        name, 
        gender, 
        dob, 
        relationship, 
        marital_status, 
        formal_education, 
        highest_achievement,
        religious_education: religiousEducationList,
        religious_education_other,
        profession: professionList,
        profession_other,
        blood_group, 
        mobile, 
        health_status: healthStatuses 
      });
    });

    // Capture dynamic Students data
    data.students = [];
    students.forEach(s => {
      const memberIdx = s.memberIdx;
      const institution_name = form.querySelector(`[name="student[${memberIdx}][institution_name]"]`)?.value || '';
      const class_course = form.querySelector(`[name="student[${memberIdx}][class_course]"]`)?.value || '';
      const career_goal = form.querySelector(`[name="student[${memberIdx}][career_goal]"]`)?.value || '';
      const student_achievements = form.querySelector(`[name="student[${memberIdx}][student_achievements]"]`)?.value || '';

      data.students.push({
        memberIdx,
        institution_name,
        class_course,
        career_goal,
        student_achievements
      });
    });

    // Capture dynamic Expatriates data
    data.expatriates = [];
    expatriates.forEach((e, idx) => {
      const name = form.querySelector(`[name="expatriate[${idx}][name]"]`)?.value || '';
      const country = form.querySelector(`[name="expatriate[${idx}][country]"]`)?.value || '';
      const countryCode = form.querySelector(`[name="expatriate[${idx}][country_code]"]`)?.value || '';
      const contactPhone = form.querySelector(`[name="expatriate[${idx}][contact_phone]"]`)?.value || '';
      const contact = countryCode && contactPhone ? `${countryCode} ${contactPhone}` : (contactPhone || countryCode);
      const profession = form.querySelector(`[name="expatriate[${idx}][profession]"]`)?.value || '';

      data.expatriates.push({ name, country, contact, profession });
    });

    // Capture Step state index
    data.currentStepIdx = currentStepIdx;

    return data;
  }

  function saveState() {
    try {
      const state = getFormState();
      localStorage.setItem('odamala_census_2026_state', JSON.stringify(state));
    } catch (err) {
      console.error('Error saving state to localStorage', err);
    }
  }

  function restoreFormState() {
    try {
      const raw = localStorage.getItem('odamala_census_2026_state');
      if (!raw) {
        // First load defaults: 1 family member card
        addMember();
        return;
      }

      const state = JSON.parse(raw);

      // Restore simple keys
      for (let key in state) {
        if (key === 'members' || key === 'expatriates' || key === 'students' || key === 'health_status' || key === 'currentStepIdx') {
          continue;
        }

        // Set Text inputs, Select fields
        const elements = form.querySelectorAll(`[name="${key}"]`);
        if (elements.length > 0) {
          if (elements[0].type === 'radio') {
            // Radio Buttons
            elements.forEach(radio => {
              if (radio.value === state[key]) {
                radio.checked = true;
              }
            });
          } else {
            // Regular values
            elements[0].value = state[key];
          }
        }
      }

      // Update Total Members Sum after loading simple values
      updateTotalMembersSum();

      // Restore dynamic Family Members
      membersContainer.innerHTML = '';
      members = [];
      if (state.members && state.members.length > 0) {
        state.members.forEach(memberData => {
          addMember(memberData);
        });
      } else {
        addMember();
      }

      // Restore dynamic Expatriates
      expatriatesList.innerHTML = '';
      expatriates = [];
      if (state.expatriates && state.expatriates.length > 0) {
        state.expatriates.forEach(expatData => {
          addExpatriate(expatData);
        });
      }

      // Trigger conditional layout calculations
      const vehicleCheck = form.querySelector('input[name="vehicle_ownership"]:checked')?.value;
      if (vehicleCheck === 'Yes') {
        vehicleDetailsContainer.classList.remove('hidden');
        // Do not make vehicle inputs required
      } else {
        vehicleDetailsContainer.classList.add('hidden');
        setInputsRequired(vehicleDetailsContainer, false);
      }

      const financialCheck = form.querySelector('input[name="financial_assistance"]:checked')?.value;
      if (financialCheck === 'Yes') {
        assistanceSourceContainer.classList.remove('hidden');
        setInputsRequired(assistanceSourceContainer, true);
      } else {
        assistanceSourceContainer.classList.add('hidden');
        setInputsRequired(assistanceSourceContainer, false);
      }

      const expatCheck = form.querySelector('input[name="has_expatriates"]:checked')?.value;
      toggleExpatriatesSection(expatCheck);

      const detailsProvidedByCheck = state.details_provided_by_type || '';
      toggleDetailsProvidedBySection(detailsProvidedByCheck);

      const surveyedByRoleCheck = form.querySelector('input[name="surveyed_by_role"]:checked')?.value || 'Cluster Coordinator';
      toggleSurveyedByRoleSection(surveyedByRoleCheck);

      // Restore Step position
      if (typeof state.currentStepIdx === 'number' && state.currentStepIdx < STEPS.length) {
        showStep(state.currentStepIdx);
      } else {
        showStep(0);
      }

      validateMembersCountAlert();

    } catch (err) {
      console.error('Error restoring localStorage state:', err);
      // Fallback
      addMember();
      showStep(0);
    }
  }

  // Bind change/input listeners for auto save
  form.querySelectorAll('input, select, textarea').forEach(element => {
    // Exclude dynamically handled elements to prevent double triggers
    if (!element.name.startsWith('member[') && !element.name.startsWith('expatriate[') && !element.name.startsWith('student[')) {
      element.addEventListener('change', () => {
        if (element.id === 'male_count' || element.id === 'female_count') {
          updateTotalMembersSum();
        }
        saveState();
        if (element.id === 'total_members') {
          validateMembersCountAlert();
        }
      });
      element.addEventListener('input', () => {
        if (element.id === 'male_count' || element.id === 'female_count') {
          updateTotalMembersSum();
        }
        saveState();
        if (element.id === 'total_members') {
          validateMembersCountAlert();
        }
      });
    }
  });

  // ==========================================
  // 8. Step Summary (Section H Preview Builder)
  // ==========================================
  
  function populateSummaryPreview() {
    const headVal = document.getElementById('family_head').value || 'Not Specified';
    const houseNumVal = document.getElementById('house_number').value || 'Not Specified';
    const totalVal = document.getElementById('total_members').value || '0';
    
    const isExpatVal = form.querySelector('input[name="has_expatriates"]:checked')?.value === 'Yes';
    const expatCountVal = isExpatVal ? expatriates.length : 0;

    summaryHead.textContent = headVal;
    summaryHouseNum.textContent = houseNumVal;
    summaryTotalMembers.textContent = totalVal;
    summaryExpatriates.textContent = expatCountVal;
  }

  // ==========================================
  // 9. Survey Submission Modal & Exports (CSV/JSON)
  // ==========================================
  
  let finalCompiledData = null; // Stored locally on submission

  function generateRefKey() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `ODML-2026-${rand}`;
  }

  function handleSurveySubmission() {
    // Validate final step before processing
    if (!validateStep('I')) return;

    // Collect all data
    const completeState = getFormState();
    
    // Extract cluster alphabet (e.g. "A" from "Block A")
    const clusterStr = (completeState.cluster || '').trim();
    const clusterAlphabet = clusterStr.length > 0 ? clusterStr.slice(-1) : '';
    const wardNo = (completeState.ward_number || '').toString().trim();
    const houseNo = (completeState.house_number || '').trim();
    
    // Formatted ID: exactly the house number
    const formattedId = houseNo;
    
    // Safe flat referenceKey for Firestore doc ID (replace slashes with hyphens, filter special chars)
    const referenceKey = formattedId.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const timestampStr = new Date().toLocaleString();

    completeState.metadata = {
      referenceKey: referenceKey,
      submittedAt: timestampStr,
      surveyVersion: "2.2.0-Census2026"
    };

    finalCompiledData = completeState;

    const recordPayload = {
      id: formattedId, // Use formatted slashed ID inside document
      submittedAt: timestampStr,
      ...completeState
    };

    // Save to Firestore Database (using safe flat referenceKey)
    db.collection("submissions").doc(referenceKey).set(recordPayload)
      .then(() => {
        console.log("Data successfully uploaded to Firestore:", referenceKey);
        
        // Clear local storage draft ONLY on success to allow starting next census
        localStorage.removeItem('odamala_census_2026_state');

        // Save to localStorage list backup
        try {
          const submissions = JSON.parse(localStorage.getItem('odamala_census_submitted') || '[]');
          submissions.push(recordPayload);
          localStorage.setItem('odamala_census_submitted', JSON.stringify(submissions));
        } catch (e) {
          console.error('Error saving submission to backup list:', e);
        }

        // Populate Modal UI
        if (modalRefKey) modalRefKey.textContent = formattedId;
        if (modalTimestamp) modalTimestamp.textContent = timestampStr;

        // Display Modal
        successModal.classList.remove('hidden');
        // Simple delay for CSS transitions
        setTimeout(() => {
          successModalCard.classList.remove('scale-95', 'opacity-0');
          successModalCard.classList.add('scale-100', 'opacity-100');
        }, 50);
      })
      .catch(err => {
        console.error("Firestore upload failed:", err);
        // Do NOT clear localStorage.
        alert("Upload to Firestore failed (offline or network error). Your typed data has been saved locally as a draft. You can safely retry submitting when your connection is restored.");
      });
  }

  // JSON Download utility
  function downloadJson() {
    if (!finalCompiledData) return;
    
    const jsonContent = JSON.stringify(finalCompiledData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `census_${finalCompiledData.metadata.referenceKey}.json`;
    
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", url);
    dlAnchorElem.setAttribute("download", filename);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    // Cleanup URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      dlAnchorElem.remove();
    }, 100);
  }

  // CSV Dynamic Export handler
  // Generates flat files mapping family members rows combined with house metadata.
  function downloadCsv() {
    if (!finalCompiledData) return;

    const data = finalCompiledData;
    const ref = data.metadata.referenceKey;
    const submitted = data.metadata.submittedAt;

    // Core columns headers
    let csvRows = [];
    const headers = [
      'Reference Key', 'Submitted At', 'Surveyed By Role', 'Surveyed By Name', 'Respondent Role', 'Respondent Name', 'GIS Location', 'Cluster', 
      'House Number', 'Panchayat', 'Ward Number', 'House Name', 'Family Head', 
      'Contact Number', 'WhatsApp (Head)', 'WhatsApp (Senior Lady)', 'Total Family Members', 'Number of Males', 'Number of Females', 
      'House Ownership', 'House Loan Status', 'Type of House', 'House Structure', 'Vehicle Ownership', 'Vehicle Status', 
      'Two Wheelers', 'Three Wheelers', 'Four Wheelers', 'Heavy Vehicles', 'Financial Assistance Received', 'Assistance Source', 
      'Expatriates Count', 'Office Verified By', 'Office Remarks', 'Remarks from Head of Family', 'Suggestions to Mahallu',
      'Member Name', 'Member Gender', 'Member DOB', 'Member Relation', 'Member Marital Status', 
      'Member Formal Education', 'Member Highest Achievement', 'Member Religious Education', 
      'Member Profession', 'Member Blood Group', 'Member Mobile', 'Member Health Status',
      'Student Institution', 'Student Class Course', 'Student Career Goal', 'Student Achievements'
    ];
    csvRows.push(headers.join(','));

    // Flatten data: one row for each family member
    const expatsCount = data.has_expatriates === 'Yes' ? data.expatriates.length : 0;
    
    const baseCols = [
      `"${ref}"`,
      `"${submitted}"`,
      `"${data.surveyed_by_role || 'Cluster Coordinator'}"`,
      `"${(data.surveyed_by_name || '').replace(/"/g, '""')}"`,
      `"${(data.details_provided_by_type || '').replace(/"/g, '""')}"`,
      `"${(data.details_provided_by_name || '').replace(/"/g, '""')}"`,
      `"${(data.gis_location || '').replace(/"/g, '""')}"`,
      `"${data.cluster.replace(/"/g, '""')}"`,
      `"${data.house_number.replace(/"/g, '""')}"`,
      `"${data.panchayat.replace(/"/g, '""')}"`,
      `"${data.ward_number}"`,
      `"${data.house_name.replace(/"/g, '""')}"`,
      `"${data.family_head.replace(/"/g, '""')}"`,
      `"${data.contact_number}"`,
      `"${data.whatsapp_head || ''}"`,
      `"${data.whatsapp_senior_lady || ''}"`,
      `"${data.total_members}"`,
      `"${data.male_count || 0}"`,
      `"${data.female_count || 0}"`,
      `"${data.house_ownership}"`,
      `"${data.house_loan_status}"`,
      `"${data.house_type}"`,
      `"${data.house_structure}"`,
      `"${data.vehicle_ownership}"`,
      `"${data.vehicle_status || 'N/A'}"`,
      `"${data.two_wheelers || 0}"`,
      `"${data.three_wheelers || 0}"`,
      `"${data.four_wheelers || 0}"`,
      `"${data.heavy_vehicles || 0}"`,
      `"${data.financial_assistance}"`,
      `"${(data.assistance_source || '').replace(/"/g, '""')}"`,
      `"${expatsCount}"`,
      `"${(data.office_verified_by || '').replace(/"/g, '""')}"`,
      `"${(data.office_remarks || '').replace(/"/g, '""')}"`,
      `"${(data.head_remarks || '').replace(/"/g, '""')}"`,
      `"${(data.committee_suggestions || '').replace(/"/g, '""')}"`
    ];

    if (data.members && data.members.length > 0) {
      data.members.forEach((m, mIdx) => {
        // Look up student details for this member
        const studentInfo = data.students?.find(s => parseInt(s.memberIdx) === mIdx) || {};
        const studentInstitution = studentInfo.institution_name || '';
        const studentClassCourse = studentInfo.class_course || '';
        const studentCareerGoal = studentInfo.career_goal || '';
        const studentAchievements = studentInfo.student_achievements || '';

        // Format religious education & profession (handling arrays)
        const relEdStr = (m.religious_education || []).join('; ') + (m.religious_education_other ? ` (Other: ${m.religious_education_other})` : '');
        const profStr = (m.profession || []).join('; ') + (m.profession_other ? ` (Other: ${m.profession_other})` : '');

        const memberCols = [
          `"${m.name.replace(/"/g, '""')}"`,
          `"${m.gender}"`,
          `"${m.dob}"`,
          `"${m.relationship}"`,
          `"${m.marital_status}"`,
          `"${(m.formal_education || '').replace(/"/g, '""')}"`,
          `"${(m.highest_achievement || '').replace(/"/g, '""')}"`,
          `"${relEdStr.replace(/"/g, '""')}"`,
          `"${profStr.replace(/"/g, '""')}"`,
          `"${m.blood_group}"`,
          `"${(m.mobile || '').replace(/"/g, '""')}"`,
          `"${(m.health_status || []).join('; ')}"`
        ];

        const studentCols = [
          `"${studentInstitution.replace(/"/g, '""')}"`,
          `"${studentClassCourse.replace(/"/g, '""')}"`,
          `"${studentCareerGoal.replace(/"/g, '""')}"`,
          `"${studentAchievements.replace(/"/g, '""')}"`
        ];

        csvRows.push([...baseCols, ...memberCols, ...studentCols].join(','));
      });
    } else {
      // Empty member and student columns if no members
      const emptyCols = Array(16).fill('""');
      csvRows.push([...baseCols, ...emptyCols].join(','));
    }

    // Prepare content & download anchor
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `census_${ref}.csv`;
    
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", url);
    dlAnchorElem.setAttribute("download", filename);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    // Cleanup URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      dlAnchorElem.remove();
    }, 100);
  }

  function resetFormAndStartNew() {
    // Hide Success Modal
    successModalCard.classList.remove('scale-100', 'opacity-100');
    successModalCard.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
      successModal.classList.add('hidden');
      
      // Reset variables & form
      form.reset();
      membersContainer.innerHTML = '';
      members = [];
      studentsContainer.innerHTML = '';
      students = [];
      expatriatesList.innerHTML = '';
      expatriates = [];
      finalCompiledData = null;

      // Reinitialize default elements
      addMember();
      
      // Default toggles configurations (ensure required attributes are stripped)
      vehicleDetailsContainer.classList.add('hidden');
      setInputsRequired(vehicleDetailsContainer, false);
      
      assistanceSourceContainer.classList.add('hidden');
      setInputsRequired(assistanceSourceContainer, false);
      
      expatriatesDetailsSection.classList.add('hidden');
      setInputsRequired(expatriatesDetailsSection, false);

      if (detailsProvidedByNameContainer) {
        detailsProvidedByNameContainer.classList.add('hidden');
        setInputsRequired(detailsProvidedByNameContainer, false);
      }

      if (assistantNameContainer) {
        assistantNameContainer.classList.add('hidden');
        setInputsRequired(assistantNameContainer, false);
      }
      
      // Jump to step 0
      showStep(0);
    }, 200);
  }

  // ==========================================
  // 10. Button Event Listeners & Bootstrapping
  // ==========================================

  // Next Step Action
  nextBtn.addEventListener('click', () => {
    const currentStepCode = STEPS[currentStepIdx];
    
    // Validate current step before advancing
    if (!validateStep(currentStepCode)) {
      return;
    }

    if (currentStepIdx < STEPS.length - 1) {
      showStep(currentStepIdx + 1);
    } else {
      // Step H Submission
      handleSurveySubmission();
    }
  });

  // Previous Step Action
  prevBtn.addEventListener('click', () => {
    if (currentStepIdx > 0) {
      showStep(currentStepIdx - 1);
    }
  });

  // Add Dynamic card items triggers
  addMemberBtn.addEventListener('click', () => addMember());
  addExpatriateBtn.addEventListener('click', () => addExpatriate());

  // Modal actions
  if (downloadJsonBtn) downloadJsonBtn.addEventListener('click', downloadJson);
  if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadCsv);
  if (closeModalBtn) closeModalBtn.addEventListener('click', resetFormAndStartNew);

  // Check settings in Firestore
  async function checkSurveyLoginRequiredSetting() {
    try {
      const doc = await db.collection("settings").doc("config").get();
      if (doc.exists) {
        const loginRequired = doc.data().survey_login_required !== false;
        // Update cache
        localStorage.setItem('survey_login_required', loginRequired ? 'true' : 'false');
        // Apply flow
        if (typeof window.applyLoginFlow === 'function') {
          window.applyLoginFlow(loginRequired);
        }
      }
    } catch (e) {
      console.error("Failed to check login config from Firestore:", e);
    }
  }

  // Initialize and run state restore
  checkSurveyLoginRequiredSetting();
  restoreFormState();

});
