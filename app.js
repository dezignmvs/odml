/**
 * Odamala Mahallu Census 2026 - Survey Logic (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Application State & Constants
  // ==========================================
  const STEPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  let currentStepIdx = 0;
  
  const stepMeta = {
    'A': {
      title: 'Section A: Survey Information',
      desc: 'Initial details, geographical indicators, and surveyed coordinator/assistant roles.'
    },
    'B': {
      title: 'Section B: Family Overview',
      desc: 'General house name, head of household, occupancy, and demographic metrics.'
    },
    'C': {
      title: 'Section C: Individual Details',
      desc: 'Biographical registry, education, profession, contact, and health details of each family member.'
    },
    'D': {
      title: 'Section D: House Information (formerly E)',
      desc: 'Property details, building status, loan liability, and vehicle ownership details.'
    },
    'E': {
      title: 'Section E: Financial Assistance (formerly F)',
      desc: 'Welfare benefits, government schemes, and charity funding status.'
    },
    'F': {
      title: 'Section F: Expatriate Details (formerly G)',
      desc: 'Details of family members currently residing, working, or studying abroad.'
    },
    'G': {
      title: 'Section G: Remarks & Review (formerly H)',
      desc: 'General notes, recommendations to Mahallu committee, and registry submit.'
    }
  };

  // State structure for dynamic rows
  let members = [];
  let expatriates = [];

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
    
    // Trigger summary panel generation on reaching Step G (Remarks & review)
    if (STEPS[index] === 'G') {
      populateSummaryPreview();
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

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2.5">
        <h4 class="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
          Family Member #${idx + 1}
        </h4>
        <button type="button" class="remove-member-btn text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider flex items-center gap-1 transition"
          style="${idx === 0 ? 'display: none;' : ''}">
          Remove
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
        <!-- Name -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
          <input type="text" name="member[${idx}][name]" placeholder="Full Name" value="${initialData.name || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Gender</label>
          <select name="member[${idx}][gender]"
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
          <input type="date" name="member[${idx}][dob]" value="${initialData.dob || ''}" max="${new Date().toISOString().split('T')[0]}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Relationship -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Relationship</label>
          <select name="member[${idx}][relationship]"
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
          <select name="member[${idx}][marital_status]"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.marital_status ? 'selected' : ''}>-- Select --</option>
            <option value="Unmarried" ${initialData.marital_status === 'Unmarried' ? 'selected' : ''}>Unmarried</option>
            <option value="Married" ${initialData.marital_status === 'Married' ? 'selected' : ''}>Married</option>
            <option value="Divorced" ${initialData.marital_status === 'Divorced' ? 'selected' : ''}>Divorced</option>
            <option value="Widowed" ${initialData.marital_status === 'Widowed' ? 'selected' : ''}>Widowed</option>
          </select>
        </div>

        <!-- Educational Qualification -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Educational Qualification</label>
          <input type="text" name="member[${idx}][educational_qualification]" placeholder="e.g. SSLC, B.Tech, PG, None" value="${initialData.educational_qualification || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Religious Education -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Religious Education</label>
          <input type="text" name="member[${idx}][religious_education]" placeholder="e.g. Madrassa 5th, None" value="${initialData.religious_education || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Formal Education -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Formal Education</label>
          <select name="member[${idx}][formal_education]"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150 cursor-pointer">
            <option value="" disabled ${!initialData.formal_education ? 'selected' : ''}>-- Select --</option>
            <option value="Yes" ${initialData.formal_education === 'Yes' ? 'selected' : ''}>Yes</option>
            <option value="No" ${initialData.formal_education === 'No' ? 'selected' : ''}>No</option>
            <option value="Ongoing" ${initialData.formal_education === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
          </select>
        </div>

        <!-- Profession -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Profession</label>
          <input type="text" name="member[${idx}][profession]" placeholder="e.g. Coolie, Student" value="${initialData.profession || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Blood Group -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Blood Group</label>
          <select name="member[${idx}][blood_group]"
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
          <input type="tel" name="member[${idx}][mobile]" placeholder="e.g. 9876543210" value="${initialData.mobile || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Health Status -->
        <div class="sm:col-span-2 md:col-span-3 border-t border-zinc-100 pt-4 mt-2">
          <span class="block text-[10px] font-medium text-zinc-400 mb-2.5 uppercase tracking-wider">Health Status</span>
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
        if (currentIdx === 0) {
          removeBtn.style.display = 'none';
        } else {
          removeBtn.style.display = 'flex';
        }
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

  // ==========================================
  // Expatriate Row Handler
  // ==========================================

  function renderExpatriateCard(idx, initialData = {}) {
    const card = document.createElement('div');
    card.className = 'expatriate-card bg-white border border-zinc-200 rounded-2xl p-5 relative transition duration-200 hover:border-zinc-300 shadow-sm';
    card.dataset.index = idx;

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
          <input type="text" name="expatriate[${idx}][country]" placeholder="e.g. UAE" value="${initialData.country || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Contact Number</label>
          <input type="tel" name="expatriate[${idx}][contact]" placeholder="with Country Code" value="${initialData.contact || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
        </div>

        <!-- Profession -->
        <div>
          <label class="block text-[10px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Profession</label>
          <input type="text" name="expatriate[${idx}][profession]" placeholder="e.g. Driver" value="${initialData.profession || ''}"
            class="block w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 text-zinc-900 text-xs shadow-sm transition duration-150">
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

    // Bind inputs changes to auto save
    card.querySelectorAll('input').forEach(input => {
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

      const inputs = card.querySelectorAll('input');
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
      input.removeAttribute('required');
      clearFieldError(input);
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
        setInputsRequired(vehicleDetailsContainer, true);
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

  // Surveyed By Role Toggle
  const surveyedByRoleRadios = document.getElementsByName('surveyed_by_role');
  surveyedByRoleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Assistant') {
        if (assistantNameContainer) {
          assistantNameContainer.classList.remove('hidden');
        }
      } else {
        if (assistantNameContainer) {
          assistantNameContainer.classList.add('hidden');
          const assistantInput = document.getElementById('assistant_name');
          if (assistantInput) assistantInput.value = '';
        }
      }
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
      if (key.startsWith('member[') || key.startsWith('expatriate[')) {
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
      const educational_qualification = form.querySelector(`[name="member[${idx}][educational_qualification]"]`)?.value || '';
      const religious_education = form.querySelector(`[name="member[${idx}][religious_education]"]`)?.value || '';
      const formal_education = form.querySelector(`[name="member[${idx}][formal_education]"]`)?.value || '';
      const profession = form.querySelector(`[name="member[${idx}][profession]"]`)?.value || '';
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

      data.members.push({ 
        name, 
        gender, 
        dob, 
        relationship, 
        marital_status, 
        educational_qualification, 
        religious_education, 
        formal_education, 
        profession, 
        blood_group, 
        mobile, 
        health_status: healthStatuses 
      });
    });

    // Capture dynamic Expatriates data
    data.expatriates = [];
    expatriates.forEach((e, idx) => {
      const name = form.querySelector(`[name="expatriate[${idx}][name]"]`)?.value || '';
      const country = form.querySelector(`[name="expatriate[${idx}][country]"]`)?.value || '';
      const contact = form.querySelector(`[name="expatriate[${idx}][contact]"]`)?.value || '';
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
        if (key === 'members' || key === 'expatriates' || key === 'health_status' || key === 'currentStepIdx') {
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
        setInputsRequired(vehicleDetailsContainer, true);
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

      const surveyedByRoleCheck = form.querySelector('input[name="surveyed_by_role"]:checked')?.value;
      if (surveyedByRoleCheck === 'Assistant') {
        if (assistantNameContainer) {
          assistantNameContainer.classList.remove('hidden');
        }
      } else {
        if (assistantNameContainer) {
          assistantNameContainer.classList.add('hidden');
        }
      }

      const detailsProvidedByCheck = state.details_provided_by_type || '';
      toggleDetailsProvidedBySection(detailsProvidedByCheck);

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
    if (!element.name.startsWith('member[') && !element.name.startsWith('expatriate[')) {
      element.addEventListener('change', () => {
        saveState();
        if (element.id === 'total_members') {
          validateMembersCountAlert();
        }
      });
      element.addEventListener('input', () => {
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
    if (!validateStep('G')) return;

    // Collect all data
    const completeState = getFormState();
    
    // Add Metadata Details
    const referenceKey = generateRefKey();
    const timestampStr = new Date().toLocaleString();

    completeState.metadata = {
      referenceKey: referenceKey,
      submittedAt: timestampStr,
      surveyVersion: "2.2.0-Census2026"
    };

    finalCompiledData = completeState;

    // Populate Modal UI
    const householdNameInput = document.getElementById('house_name').value || 'Household';
    const familyHeadInput = document.getElementById('family_head').value || 'Family';
    modalHouseholdName.textContent = `"${householdNameInput}" (${familyHeadInput})`;
    modalRefKey.textContent = referenceKey;
    modalTotalMembers.textContent = completeState.total_members;
    modalTimestamp.textContent = timestampStr;

    // Display Modal
    successModal.classList.remove('hidden');
    // Simple delay for CSS transitions
    setTimeout(() => {
      successModalCard.classList.remove('scale-95', 'opacity-0');
      successModalCard.classList.add('scale-100', 'opacity-100');
    }, 50);

    // Clear local storage on success to allow starting next census
    localStorage.removeItem('odamala_census_2026_state');
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
      'Reference Key', 'Submitted At', 'Surveyed By Role', 'Coordinator Name', 'Assistant Name', 'Respondent Role', 'Respondent Name', 'GIS Location', 'Cluster', 
      'House Number', 'Panchayat', 'Ward Number', 'House Name', 'Family Head', 'House Owner Gender', 
      'Contact Number', 'WhatsApp (Head)', 'WhatsApp (Senior Lady)', 'Total Family Members', 'Number of Males', 'Number of Females', 'Donation Status', 
      'House Ownership', 'House Loan Status', 'Type of House', 'House Structure', 'Vehicle Ownership', 'Vehicle Status', 
      'Two Wheelers', 'Three Wheelers', 'Four Wheelers', 'Heavy Vehicles', 'Financial Assistance Received', 'Assistance Source', 
      'Expatriates Count', 'Office Status', 'Office Verified By', 'Office Remarks',
      'Member Name', 'Member Gender', 'Member DOB', 'Member Relation', 'Member Marital Status', 
      'Member Educational Qualification', 'Member Religious Education', 'Member Formal Education', 
      'Member Profession', 'Member Blood Group', 'Member Mobile', 'Member Health Status'
    ];
    csvRows.push(headers.join(','));

    // Flatten data: one row for each family member
    const expatsCount = data.has_expatriates === 'Yes' ? data.expatriates.length : 0;
    
    const baseCols = [
      `"${ref}"`,
      `"${submitted}"`,
      `"${data.surveyed_by_role || 'Cluster Coordinator'}"`,
      `"${(data.coordinator_name || '').replace(/"/g, '""')}"`,
      `"${(data.assistant_name || '').replace(/"/g, '""')}"`,
      `"${(data.details_provided_by_type || '').replace(/"/g, '""')}"`,
      `"${(data.details_provided_by_name || '').replace(/"/g, '""')}"`,
      `"${(data.gis_location || '').replace(/"/g, '""')}"`,
      `"${data.cluster.replace(/"/g, '""')}"`,
      `"${data.house_number.replace(/"/g, '""')}"`,
      `"${data.panchayat.replace(/"/g, '""')}"`,
      `"${data.ward_number}"`,
      `"${data.house_name.replace(/"/g, '""')}"`,
      `"${data.family_head.replace(/"/g, '""')}"`,
      `"${data.house_owner_gender || 'Male'}"`,
      `"${data.contact_number}"`,
      `"${data.whatsapp_head || ''}"`,
      `"${data.whatsapp_senior_lady || ''}"`,
      `"${data.total_members}"`,
      `"${data.male_count || 0}"`,
      `"${data.female_count || 0}"`,
      `"${data.donation_status}"`,
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
      `"${data.office_status || 'Pending'}"`,
      `"${(data.office_verified_by || '').replace(/"/g, '""')}"`,
      `"${(data.office_remarks || '').replace(/"/g, '""')}"`
    ];

    if (data.members && data.members.length > 0) {
      data.members.forEach(m => {
        const memberCols = [
          `"${m.name.replace(/"/g, '""')}"`,
          `"${m.gender}"`,
          `"${m.dob}"`,
          `"${m.relationship}"`,
          `"${m.marital_status}"`,
          `"${(m.educational_qualification || '').replace(/"/g, '""')}"`,
          `"${(m.religious_education || '').replace(/"/g, '""')}"`,
          `"${m.formal_education || ''}"`,
          `"${m.profession.replace(/"/g, '""')}"`,
          `"${m.blood_group}"`,
          `"${(m.mobile || '').replace(/"/g, '""')}"`,
          `"${(m.health_status || []).join('; ')}"`
        ];
        csvRows.push([...baseCols, ...memberCols].join(','));
      });
    } else {
      // Empty members columns if none
      const emptyMemberCols = ['', '', '', '', '', '', '', '', '', '', '', ''];
      csvRows.push([...baseCols, ...emptyMemberCols].join(','));
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

      if (coordinatorNameContainer) {
        coordinatorNameContainer.classList.add('hidden');
        setInputsRequired(coordinatorNameContainer, false);
      }

      if (assistantNameContainer) {
        assistantNameContainer.classList.add('hidden');
        setInputsRequired(assistantNameContainer, false);
      }

      if (detailsProvidedByNameContainer) {
        detailsProvidedByNameContainer.classList.add('hidden');
        setInputsRequired(detailsProvidedByNameContainer, false);
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
  downloadJsonBtn.addEventListener('click', downloadJson);
  downloadCsvBtn.addEventListener('click', downloadCsv);
  closeModalBtn.addEventListener('click', resetFormAndStartNew);

  // Initialize and run state restore
  restoreFormState();

});
