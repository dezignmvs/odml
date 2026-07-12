/**
 * Odamala Mahallu Census 2026 - Database Listing & Details View Logic
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
  // 1. State & Initialization
  // ==========================================
  let allSubmissions = [];

  async function loadSubmissions() {
    try {
      const querySnapshot = await db.collection("submissions").get();
      let tempSubmissions = [];
      querySnapshot.forEach((docSnap) => {
        tempSubmissions.push(docSnap.data());
      });
      allSubmissions = tempSubmissions;
    } catch (e) {
      console.error("Firestore loading failed:", e);
      allSubmissions = [];
    }
    
    // Update stats and render list view
    updateStats();
    renderView();
  }

  // ==========================================
  // 3. DOM Elements
  // ==========================================
  const searchInput = document.getElementById('searchInput');
  const clusterFilter = document.getElementById('clusterFilter');
  const sortSelect = document.getElementById('sortSelect');
  
  const databaseTableBody = document.getElementById('databaseTableBody');
  const databaseMobileGrid = document.getElementById('databaseMobileGrid');
  const emptyState = document.getElementById('emptyState');
  
  const statHouseholds = document.getElementById('statHouseholds');
  const statMembers = document.getElementById('statMembers');
  const statExpats = document.getElementById('statExpats');

  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnExportCSV = document.getElementById('btnExportCSV');

  // Details Modal Elements
  const detailOverlay = document.getElementById('detailOverlay');
  const detailCard = document.getElementById('detailCard');
  const closeDetailBtn = document.getElementById('closeDetailBtn');

  // Detail Val Placeholders
  const detailId = document.getElementById('detailId');
  const detailTitle = document.getElementById('detailTitle');
  const detailDate = document.getElementById('detailDate');

  const valCluster = document.getElementById('valCluster');
  const valWard = document.getElementById('valWard');
  const valHouseNum = document.getElementById('valHouseNum');
  const valPanchayat = document.getElementById('valPanchayat');
  const valGis = document.getElementById('valGis');

  const valHead = document.getElementById('valHead');
  const valContact = document.getElementById('valContact');
  const valWhatsappHead = document.getElementById('valWhatsappHead');
  const valWhatsappLady = document.getElementById('valWhatsappLady');

  const valOwnership = document.getElementById('valOwnership');
  const valHouseType = document.getElementById('valHouseType');
  const valStructure = document.getElementById('valStructure');
  const valLoan = document.getElementById('valLoan');
  const valVehicles = document.getElementById('valVehicles');

  const valAssistance = document.getElementById('valAssistance');
  const valAssistanceSource = document.getElementById('valAssistanceSource');

  const detailExpatsContainer = document.getElementById('detailExpatsContainer');
  const detailNoExpats = document.getElementById('detailNoExpats');

  const detailStudentsContainer = document.getElementById('detailStudentsContainer');
  const detailNoStudents = document.getElementById('detailNoStudents');

  const detailMembersTableBody = document.getElementById('detailMembersTableBody');

  const valRemarksHead = document.getElementById('valRemarksHead');
  const valRemarksCommittee = document.getElementById('valRemarksCommittee');
  const valVerifiedBy = document.getElementById('valVerifiedBy');
  const valOfficeRemarks = document.getElementById('valOfficeRemarks');

  // ==========================================
  // 4. Data Processing (Search, Filter, Sort)
  // ==========================================
  
  function getFilteredAndSortedData() {
    const query = searchInput.value.trim().toLowerCase();
    const cluster = clusterFilter.value;
    const sort = sortSelect.value;

    // Filter
    let filtered = allSubmissions.filter(item => {
      // Cluster filter match
      if (cluster && item.cluster !== cluster) {
        return false;
      }
      
      // Search query match
      if (query) {
        const matchesId = (item.id || '').toLowerCase().includes(query);
        const matchesHead = (item.family_head || '').toLowerCase().includes(query);
        const matchesHouseName = (item.house_name || '').toLowerCase().includes(query);
        const matchesWard = (item.ward_number || '').toString().includes(query);
        const matchesContact = (item.contact_number || '').includes(query);
        const matchesClusterName = (item.cluster || '').toLowerCase().includes(query);
        
        // Match member names
        const matchesMembers = item.members && item.members.some(m => 
          (m.name || '').toLowerCase().includes(query)
        );

        return matchesId || matchesHead || matchesHouseName || matchesWard || matchesContact || matchesClusterName || matchesMembers;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.submittedAt);
      const dateB = new Date(b.date || b.submittedAt);

      switch (sort) {
        case 'date_asc':
          return dateA - dateB;
        case 'head_asc':
          return (a.family_head || '').localeCompare(b.family_head || '');
        case 'head_desc':
          return (b.family_head || '').localeCompare(a.family_head || '');
        case 'members_desc':
          return (parseInt(b.total_members) || 0) - (parseInt(a.total_members) || 0);
        case 'members_asc':
          return (parseInt(a.total_members) || 0) - (parseInt(b.total_members) || 0);
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }

  // ==========================================
  // 5. DOM Rendering
  // ==========================================
  
  function updateStats() {
    statHouseholds.textContent = allSubmissions.length;
    
    let totalMembers = 0;
    let totalExpats = 0;
    
    allSubmissions.forEach(item => {
      totalMembers += (parseInt(item.total_members) || 0);
      if (item.has_expatriates === 'Yes' && item.expatriates) {
        totalExpats += item.expatriates.length;
      }
    });
    
    statMembers.textContent = totalMembers;
    statExpats.textContent = totalExpats;
  }

  function getDonationBadgeHTML(status) {
    const val = status || '';
    if (val === 'Regular Paid') {
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>`;
    } else if (val === 'Pending') {
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>`;
    } else if (val === 'Exempted') {
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Exempted</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-600 border border-zinc-200">${val || 'N/A'}</span>`;
  }

  function deleteRecord(itemId) {
    if (confirm(`Are you sure you want to delete the record for ID: ${itemId}?`)) {
      // 1. Delete from Firestore
      db.collection("submissions").doc(itemId).delete()
        .then(() => {
          console.log(`Document ${itemId} deleted successfully from Firestore.`);
        })
        .catch(err => {
          console.error("Error deleting from Firestore:", err);
        });

      // 2. Delete from local state array
      allSubmissions = allSubmissions.filter(sub => sub.id !== itemId);

      // 3. Update stats and refresh view
      updateStats();
      renderView();
    }
  }

  function renderView() {
    const records = getFilteredAndSortedData();
    
    databaseTableBody.innerHTML = '';
    databaseMobileGrid.innerHTML = '';
    
    if (records.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    } else {
      emptyState.classList.add('hidden');
    }

    records.forEach(item => {
      // 1. Table Row (Desktop)
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-zinc-50 border-b border-zinc-100 cursor-pointer transition';
      tr.innerHTML = `
        <td class="py-4 px-6 font-mono text-[11px] text-zinc-500 font-semibold">${item.id}</td>
        <td class="py-4 px-6 text-zinc-950 font-bold">${item.house_name || 'N/A'}</td>
        <td class="py-4 px-6 text-zinc-800">${item.family_head || 'N/A'}</td>
        <td class="py-4 px-6">${item.cluster} / W-${item.ward_number}</td>
        <td class="py-4 px-6 text-zinc-500">${item.contact_number || 'N/A'}</td>
        <td class="py-4 px-6">
          <span class="inline-flex items-center justify-center bg-zinc-100 text-zinc-800 text-xs font-bold w-6 h-6 rounded-full">${item.total_members}</span>
        </td>
        <td class="py-4 px-6 text-zinc-400 font-medium text-[11px]">${item.date || item.submittedAt || 'N/A'}</td>
        <td class="py-4 px-6 text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="view-details-btn inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-brand-600 text-brand-600 hover:text-white rounded-lg text-[11px] font-bold border border-indigo-100 transition shadow-sm">
              <span>View Profile</span>
              <i class="fa-solid fa-chevron-right text-[8px]"></i>
            </button>
            <button class="delete-record-btn inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-[11px] font-bold border border-red-100 transition shadow-sm">
              <i class="fa-solid fa-trash-can text-[10px]"></i>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
      
      // Bind click handler to row (view detail)
      tr.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          showDetailOverlay(item);
        }
      });
      tr.querySelector('.view-details-btn').addEventListener('click', () => {
        showDetailOverlay(item);
      });
      tr.querySelector('.delete-record-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteRecord(item.id);
      });
      databaseTableBody.appendChild(tr);

      // 2. Card Layout (Mobile)
      const card = document.createElement('div');
      card.className = 'p-5 space-y-3 cursor-pointer hover:bg-zinc-50 transition';
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-zinc-950 text-sm">${item.house_name || 'N/A'}</h4>
            <p class="text-xs text-zinc-500 font-medium mt-0.5">Head: <span class="font-semibold text-zinc-800">${item.family_head}</span></p>
          </div>
          <span class="font-mono text-[9px] bg-zinc-150 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-semibold">${item.id}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div><i class="fa-solid fa-map-location-dot mr-1"></i> ${item.cluster} (W-${item.ward_number})</div>
          <div><i class="fa-solid fa-phone mr-1"></i> ${item.contact_number || 'N/A'}</div>
          <div><i class="fa-solid fa-users mr-1"></i> Members: <span class="font-bold text-zinc-800">${item.total_members}</span></div>
          <div><i class="fa-solid fa-calendar mr-1"></i> ${item.date || item.submittedAt}</div>
        </div>

        <div class="flex justify-end pt-1 gap-2">
          <button class="view-details-btn-mobile w-full flex items-center justify-center gap-1 py-2 bg-indigo-50 text-brand-600 rounded-lg text-xs font-bold border border-indigo-100 transition shadow-sm">
            <span>View Detailed Profile</span>
            <i class="fa-solid fa-chevron-right text-[9px]"></i>
          </button>
          <button class="delete-record-btn-mobile flex-shrink-0 flex items-center justify-center gap-1 px-4 py-2 bg-red-50 text-red-650 rounded-lg text-xs font-bold border border-red-100 transition shadow-sm">
            <i class="fa-solid fa-trash-can text-[11px]"></i>
            <span>Delete</span>
          </button>
        </div>
      `;
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          showDetailOverlay(item);
        }
      });
      card.querySelector('.view-details-btn-mobile').addEventListener('click', () => {
        showDetailOverlay(item);
      });
      card.querySelector('.delete-record-btn-mobile').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteRecord(item.id);
      });
      databaseMobileGrid.appendChild(card);
    });
  }

  // ==========================================
  // 6. Detailed Profile Viewer Overlay
  // ==========================================
  
  function showDetailOverlay(item) {
    // Fill text placeholders
    detailId.textContent = item.id;
    detailTitle.textContent = item.house_name || 'Unnamed Household';
    detailDate.textContent = item.date || item.submittedAt || 'N/A';

    valCluster.textContent = item.cluster || '--';
    valWard.textContent = item.ward_number || '--';
    valHouseNum.textContent = item.house_number || '--';
    valPanchayat.textContent = item.panchayat || '--';
    valGis.textContent = item.gis_location || 'Not Configured';

    valHead.textContent = item.family_head || '--';
    valContact.textContent = item.contact_number || '--';
    valWhatsappHead.textContent = item.whatsapp_head || 'None';
    valWhatsappLady.textContent = item.whatsapp_senior_lady || 'None';

    valOwnership.textContent = item.house_ownership || '--';
    valHouseType.textContent = item.house_type || '--';
    valStructure.textContent = item.house_structure || '--';
    valLoan.textContent = item.house_loan_status || '--';

    // Vehicles format
    if (item.vehicle_ownership === 'Yes') {
      const vDetails = [];
      if (parseInt(item.two_wheelers) > 0) vDetails.push(`${item.two_wheelers} Two-wheeler(s)`);
      if (parseInt(item.three_wheelers) > 0) vDetails.push(`${item.three_wheelers} Three-wheeler(s)`);
      if (parseInt(item.four_wheelers) > 0) vDetails.push(`${item.four_wheelers} Four-wheeler(s)`);
      if (parseInt(item.heavy_vehicles) > 0) vDetails.push(`${item.heavy_vehicles} Heavy vehicle(s)`);
      
      const vStatus = item.vehicle_status ? ` (${item.vehicle_status})` : '';
      valVehicles.textContent = `Yes - ${vDetails.join(', ') || 'Registered Details Not Specified'}${vStatus}`;
    } else {
      valVehicles.textContent = 'No Vehicles Owned';
    }

    // Welfare
    valAssistance.textContent = item.financial_assistance || '--';
    valAssistanceSource.textContent = item.assistance_source || 'No assistance scheme listed.';

    // Expatriates
    detailExpatsContainer.innerHTML = '';
    if (item.has_expatriates === 'Yes' && item.expatriates && item.expatriates.length > 0) {
      detailNoExpats.classList.add('hidden');
      item.expatriates.forEach(expat => {
        const expDiv = document.createElement('div');
        expDiv.className = 'bg-white border border-zinc-200 rounded-xl p-4 shadow-sm';
        expDiv.innerHTML = `
          <h5 class="text-xs font-bold text-zinc-900 truncate">${expat.name || 'Expatriate'}</h5>
          <div class="grid grid-cols-2 gap-y-1 mt-2.5 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
            <div>Country: <span class="text-zinc-800 font-normal block font-sans">${expat.country || 'N/A'}</span></div>
            <div>Job: <span class="text-zinc-800 font-normal block font-sans">${expat.profession || 'N/A'}</span></div>
            <div class="col-span-2 mt-1">Contact: <span class="text-zinc-800 font-mono font-normal block mt-0.5 normal-case tracking-normal">${expat.contact || 'N/A'}</span></div>
          </div>
        `;
        detailExpatsContainer.appendChild(expDiv);
      });
    } else {
      detailNoExpats.classList.remove('hidden');
    }

    // Students
    detailStudentsContainer.innerHTML = '';
    if (item.students && item.students.length > 0) {
      detailNoStudents.classList.add('hidden');
      item.students.forEach(student => {
        const memberIdx = parseInt(student.memberIdx);
        const memberName = item.members && item.members[memberIdx] ? item.members[memberIdx].name : `Member #${memberIdx + 1}`;
        
        const studDiv = document.createElement('div');
        studDiv.className = 'bg-white border border-zinc-200 rounded-xl p-4 shadow-sm';
        studDiv.innerHTML = `
          <h5 class="text-xs font-bold text-zinc-900 truncate">${memberName}</h5>
          <div class="grid grid-cols-2 gap-y-1.5 mt-2.5 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
            <div class="col-span-2">Institution: <span class="text-zinc-800 font-normal block font-sans truncate normal-case tracking-normal">${student.institution_name || 'N/A'}</span></div>
            <div>Class/Course: <span class="text-zinc-800 font-normal block font-sans truncate normal-case tracking-normal">${student.class_course || 'N/A'}</span></div>
            <div>Career Goal: <span class="text-zinc-800 font-normal block font-sans truncate normal-case tracking-normal">${student.career_goal || 'N/A'}</span></div>
            <div class="col-span-2 mt-1">Achievements: <span class="text-zinc-800 font-normal block font-sans truncate normal-case tracking-normal">${student.student_achievements || 'None'}</span></div>
          </div>
        `;
        detailStudentsContainer.appendChild(studDiv);
      });
    } else {
      detailNoStudents.classList.remove('hidden');
    }

    // Members list rows
    detailMembersTableBody.innerHTML = '';
    if (item.members && item.members.length > 0) {
      item.members.forEach(member => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-zinc-50 border-b border-zinc-100 transition text-[11px]';
        
        // Format health conditions
        let healthBadges = 'None';
        if (member.health_status && member.health_status.length > 0) {
          healthBadges = member.health_status.map(h => {
            if (h === 'Healthy') {
              return `<span class="inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">Healthy</span>`;
            }
            return `<span class="inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-red-50 text-red-700 rounded-md border border-red-100 mb-1 mr-1">${h}</span>`;
          }).join('');
        }

        // Format religious education & profession (handling arrays)
        const relEdStr = (member.religious_education || []).join(', ') + (member.religious_education_other ? ` (Other: ${member.religious_education_other})` : '');
        const profStr = (member.profession || []).join(', ') + (member.profession_other ? ` (Other: ${member.profession_other})` : '');

        tr.innerHTML = `
          <td class="py-3.5 px-4 font-semibold text-zinc-900">${member.name || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.relationship || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.gender || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-500 font-mono">${member.dob || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.marital_status || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.formal_education || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.highest_achievement || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${relEdStr || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${profStr || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-500 font-bold">${member.blood_group || '--'}</td>
          <td class="py-3.5 px-4 text-left font-sans">${healthBadges}</td>
        `;
        detailMembersTableBody.appendChild(tr);
      });
    } else {
      detailMembersTableBody.innerHTML = `<tr><td colspan="11" class="py-4 text-center text-zinc-400 font-medium bg-zinc-50">No member bio records attached.</td></tr>`;
    }

    // Remarks
    valRemarksHead.textContent = item.head_remarks || item.owner_remarks || 'None recorded.';
    valRemarksCommittee.textContent = item.committee_suggestions || 'None recorded.';
    valVerifiedBy.textContent = item.office_verified_by || 'Not Verified';
    valOfficeRemarks.textContent = item.office_remarks || 'No official notes added.';

    // Show Overlay
    detailOverlay.classList.remove('hidden');
    setTimeout(() => {
      detailCard.classList.remove('scale-95', 'opacity-0');
      detailCard.classList.add('scale-100', 'opacity-100');
    }, 50);
  }

  function closeDetailOverlay() {
    detailCard.classList.remove('scale-100', 'opacity-100');
    detailCard.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
      detailOverlay.classList.add('hidden');
    }, 250);
  }

  // ==========================================
  // 7. Dynamic Data Exports (JSON / CSV)
  // ==========================================
  
  function downloadFilteredJSON() {
    const data = getFilteredAndSortedData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", url);
    dlAnchorElem.setAttribute("download", `census_records_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
      dlAnchorElem.remove();
    }, 100);
  }

  function downloadFilteredCSV() {
    const records = getFilteredAndSortedData();
    
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
    
    let csvRows = [headers.join(',')];

    records.forEach(item => {
      const expatsCount = item.has_expatriates === 'Yes' && item.expatriates ? item.expatriates.length : 0;
      
      const baseCols = [
        `"${item.id || ''}"`,
        `"${item.date || item.submittedAt || ''}"`,
        `"${item.surveyed_by_role || 'Cluster Coordinator'}"`,
        `"${(item.surveyed_by_name || '').replace(/"/g, '""')}"`,
        `"${(item.details_provided_by_type || '').replace(/"/g, '""')}"`,
        `"${(item.details_provided_by_name || '').replace(/"/g, '""')}"`,
        `"${(item.gis_location || '').replace(/"/g, '""')}"`,
        `"${(item.cluster || '').replace(/"/g, '""')}"`,
        `"${(item.house_number || '').replace(/"/g, '""')}"`,
        `"${(item.panchayat || '').replace(/"/g, '""')}"`,
        `"${item.ward_number || ''}"`,
        `"${(item.house_name || '').replace(/"/g, '""')}"`,
        `"${(item.family_head || '').replace(/"/g, '""')}"`,
        `"${item.contact_number || ''}"`,
        `"${item.whatsapp_head || ''}"`,
        `"${item.whatsapp_senior_lady || ''}"`,
        `"${item.total_members || ''}"`,
        `"${item.male_count || 0}"`,
        `"${item.female_count || 0}"`,
        `"${item.house_ownership || ''}"`,
        `"${item.house_loan_status || ''}"`,
        `"${item.house_type || ''}"`,
        `"${item.house_structure || ''}"`,
        `"${item.vehicle_ownership || 'No'}"`,
        `"${item.vehicle_status || 'N/A'}"`,
        `"${item.two_wheelers || 0}"`,
        `"${item.three_wheelers || 0}"`,
        `"${item.four_wheelers || 0}"`,
        `"${item.heavy_vehicles || 0}"`,
        `"${item.financial_assistance || ''}"`,
        `"${(item.assistance_source || '').replace(/"/g, '""')}"`,
        `"${expatsCount}"`,
        `"${(item.office_verified_by || '').replace(/"/g, '""')}"`,
        `"${(item.office_remarks || '').replace(/"/g, '""')}"`,
        `"${(item.head_remarks || item.owner_remarks || '').replace(/"/g, '""')}"`,
        `"${(item.committee_suggestions || '').replace(/"/g, '""')}"`
      ];

      if (item.members && item.members.length > 0) {
        item.members.forEach((m, mIdx) => {
          const studentInfo = item.students?.find(s => parseInt(s.memberIdx) === mIdx) || {};
          const studentInstitution = studentInfo.institution_name || '';
          const studentClassCourse = studentInfo.class_course || '';
          const studentCareerGoal = studentInfo.career_goal || '';
          const studentAchievements = studentInfo.student_achievements || '';

          const relEdStr = (m.religious_education || []).join('; ') + (m.religious_education_other ? ` (Other: ${m.religious_education_other})` : '');
          const profStr = (m.profession || []).join('; ') + (m.profession_other ? ` (Other: ${m.profession_other})` : '');

          const memberCols = [
            `"${(m.name || '').replace(/"/g, '""')}"`,
            `"${m.gender || ''}"`,
            `"${m.dob || ''}"`,
            `"${m.relationship || ''}"`,
            `"${m.marital_status || ''}"`,
            `"${(m.formal_education || '').replace(/"/g, '""')}"`,
            `"${(m.highest_achievement || '').replace(/"/g, '""')}"`,
            `"${relEdStr.replace(/"/g, '""')}"`,
            `"${profStr.replace(/"/g, '""')}"`,
            `"${m.blood_group || ''}"`,
            `"${m.mobile || ''}"`,
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
        const emptyCols = Array(16).fill('""');
        csvRows.push([...baseCols, ...emptyCols].join(','));
      }
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", url);
    dlAnchorElem.setAttribute("download", `census_records_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
      dlAnchorElem.remove();
    }, 100);
  }

  // ==========================================
  // 8. Event Listeners & Bootstrapping
  // ==========================================
  
  searchInput.addEventListener('input', renderView);
  clusterFilter.addEventListener('change', renderView);
  sortSelect.addEventListener('change', renderView);

  btnExportJSON.addEventListener('click', downloadFilteredJSON);
  btnExportCSV.addEventListener('click', downloadFilteredCSV);

  closeDetailBtn.addEventListener('click', closeDetailOverlay);
  
  // Close details overlay on click outside card
  detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) {
      closeDetailOverlay();
    }
  });

  // Esc key closes detail overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailOverlay.classList.contains('hidden')) {
      closeDetailOverlay();
    }
  });



  // Load and Render
  loadSubmissions();

});
