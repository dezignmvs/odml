/**
 * Odamala Mahallu Census 2026 - Database Listing & Details View Logic
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7aFZ8KBiSsKSiH7wXJoyajiXbNQetJeQ",
  authDomain: "mahall-2571a.firebaseapp.com",
  projectId: "mahall-2571a",
  storageBucket: "mahall-2571a.firebasestorage.app",
  messagingSenderId: "1005280778183",
  appId: "1:1005280778183:web:e87c0d21bbaffae2506be2",
  measurementId: "G-T71NV8DGTL"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Mock Data Definitions
  // ==========================================
  const mockSubmissions = [
    {
      id: "ODMLBlockA14MH202612A",
      submittedAt: "7/11/2026, 10:15:30 AM",
      cluster: "Block A",
      ward_number: "14",
      house_number: "MH/2026/12A",
      panchayat: "Odamala Panchayat",
      gis_location: "11.012345, 76.123456",
      surveyed_by_role: "Cluster Coordinator",
      details_provided_by_type: "Head of Family",
      details_provided_by_name: "",
      house_name: "Baitul Noor",
      family_head: "Moideen Kutty",
      house_owner_gender: "Male",
      contact_number: "9876543210",
      whatsapp_head: "9876543210",
      whatsapp_senior_lady: "9876543211",
      total_members: "4",
      male_count: "2",
      female_count: "2",
      donation_status: "Regular Paid",
      house_ownership: "Owned by Head/Spouse",
      house_loan_status: "No Liabilities",
      house_type: "Concrete",
      house_structure: "Double Floor",
      vehicle_ownership: "Yes",
      vehicle_status: "Private",
      two_wheelers: "1",
      three_wheelers: "0",
      four_wheelers: "1",
      heavy_vehicles: "0",
      financial_assistance: "No",
      assistance_source: "",
      has_expatriates: "Yes",
      expatriates: [
        { name: "Faisal Moideen", country: "UAE", contact: "+971501234567", profession: "Sales Executive" }
      ],
      members: [
        { name: "Moideen Kutty", relationship: "Self", gender: "Male", dob: "1971-05-15", marital_status: "Married", formal_education: "Yes", educational_qualification: "SSLC", profession: "Coolie", blood_group: "O+", health_status: ["Healthy"] },
        { name: "Amina Kutty", relationship: "Spouse", gender: "Female", dob: "1978-08-20", marital_status: "Married", formal_education: "Yes", educational_qualification: "7th Std", profession: "Housewife", blood_group: "B+", health_status: ["Healthy"] },
        { name: "Faisal Moideen", relationship: "Son", gender: "Male", dob: "2001-11-10", marital_status: "Unmarried", formal_education: "Yes", educational_qualification: "B.Tech", profession: "Sales Executive", blood_group: "O+", health_status: ["Healthy"] },
        { name: "Fathima Moideen", relationship: "Daughter", gender: "Female", dob: "2006-03-12", marital_status: "Unmarried", formal_education: "Ongoing", educational_qualification: "Plus Two", profession: "Student", blood_group: "A+", health_status: ["Healthy"] }
      ],
      owner_remarks: "We have lived in Block A for 15 years.",
      committee_suggestions: "Need better street lights on Block A main road.",
      office_verified_by: "Cluster Coordinator",
      office_remarks: "All details verified and found correct."
    },
    {
      id: "ODMLBlockC08MH202678B",
      submittedAt: "7/11/2026, 11:22:45 AM",
      cluster: "Block C",
      ward_number: "8",
      house_number: "MH/2026/78B",
      panchayat: "Odamala Panchayat",
      gis_location: "11.012400, 76.123500",
      surveyed_by_role: "Assistant",
      assistant_name: "Zainul Abid",
      details_provided_by_type: "Family Member",
      details_provided_by_name: "Amina Beevi",
      house_name: "Amina Manzil",
      family_head: "Amina Beevi",
      house_owner_gender: "Female",
      contact_number: "9946123456",
      whatsapp_head: "9946123456",
      whatsapp_senior_lady: "9946123456",
      total_members: "3",
      male_count: "1",
      female_count: "2",
      donation_status: "Pending",
      house_ownership: "Ancestral Property",
      house_loan_status: "Yes",
      house_type: "Tiled Roof",
      house_structure: "Single Floor",
      vehicle_ownership: "No",
      financial_assistance: "Yes",
      assistance_source: "Widow Pension, Mahallu Charity Fund",
      has_expatriates: "No",
      expatriates: [],
      members: [
        { name: "Amina Beevi", relationship: "Self", gender: "Female", dob: "1966-02-14", marital_status: "Widowed", formal_education: "Yes", educational_qualification: "5th Std", profession: "Pensioner", blood_group: "AB+", health_status: ["Healthy"] },
        { name: "Sajid K.", relationship: "Son", gender: "Male", dob: "2004-09-05", marital_status: "Unmarried", formal_education: "Yes", educational_qualification: "Plus Two", profession: "Coolie", blood_group: "O+", health_status: ["Healthy"] },
        { name: "Shefeena K.", relationship: "Daughter", gender: "Female", dob: "2008-07-22", marital_status: "Unmarried", formal_education: "Ongoing", educational_qualification: "10th Std", profession: "Student", blood_group: "B+", health_status: ["Healthy"] }
      ],
      owner_remarks: "Requires financial aid for roof repairs before monsoon.",
      committee_suggestions: "Requests consideration for Mahallu housing aid.",
      office_verified_by: "Assistant - Zainul Abid",
      office_remarks: "Flagged for welfare committee review due to loan liability."
    },
    {
      id: "ODMLBlockK05MH2026105",
      submittedAt: "7/11/2026, 01:45:10 PM",
      cluster: "Block K",
      ward_number: "5",
      house_number: "MH/2026/105",
      panchayat: "Odamala Panchayat",
      gis_location: "11.013000, 76.124000",
      surveyed_by_role: "Cluster Coordinator",
      details_provided_by_type: "Head of Family",
      details_provided_by_name: "",
      house_name: "Al Yasmeen",
      family_head: "Kader Haji",
      house_owner_gender: "Male",
      contact_number: "9845112233",
      whatsapp_head: "9845112233",
      whatsapp_senior_lady: "9845998877",
      total_members: "5",
      male_count: "3",
      female_count: "2",
      donation_status: "Regular Paid",
      house_ownership: "Owned by Head/Spouse",
      house_loan_status: "No Liabilities",
      house_type: "Concrete",
      house_structure: "Double Floor",
      vehicle_ownership: "Yes",
      vehicle_status: "Private",
      two_wheelers: "2",
      three_wheelers: "0",
      four_wheelers: "2",
      heavy_vehicles: "0",
      financial_assistance: "Not Required",
      assistance_source: "",
      has_expatriates: "Yes",
      expatriates: [
        { name: "Yousef Kader", country: "Qatar", contact: "+97455123456", profession: "Engineer" },
        { name: "Anas Kader", country: "Saudi Arabia", contact: "+96650987654", profession: "Accountant" }
      ],
      members: [
        { name: "Kader Haji", relationship: "Self", gender: "Male", dob: "1964-04-10", marital_status: "Married", formal_education: "Yes", educational_qualification: "Pre-Degree", profession: "Merchant", blood_group: "A+", health_status: ["Healthy"] },
        { name: "Mariyam", relationship: "Spouse", gender: "Female", dob: "1970-10-12", marital_status: "Married", formal_education: "Yes", educational_qualification: "SSLC", profession: "Housewife", blood_group: "O+", health_status: ["Healthy"] },
        { name: "Yousef Kader", relationship: "Son", gender: "Male", dob: "1994-12-05", marital_status: "Married", formal_education: "Yes", educational_qualification: "B.Tech", profession: "Engineer", blood_group: "A+", health_status: ["Healthy"] },
        { name: "Anas Kader", relationship: "Son", gender: "Male", dob: "1998-06-25", marital_status: "Unmarried", formal_education: "Yes", educational_qualification: "B.Com", profession: "Accountant", blood_group: "B+", health_status: ["Healthy"] },
        { name: "Shifa Yousef", relationship: "Other", gender: "Female", dob: "2000-01-15", marital_status: "Married", formal_education: "Yes", educational_qualification: "Degree", profession: "Housewife", blood_group: "O+", health_status: ["Healthy"] }
      ],
      owner_remarks: "",
      committee_suggestions: "",
      office_verified_by: "Cluster Coordinator",
      office_remarks: "Information confirmed."
    }
  ];

  // ==========================================
  // 2. State & Initialization
  // ==========================================
  let allSubmissions = [];

  async function loadSubmissions() {
    try {
      const querySnapshot = await getDocs(collection(db, "submissions"));
      let tempSubmissions = [];
      querySnapshot.forEach((docSnap) => {
        tempSubmissions.push(docSnap.data());
      });
      
      if (tempSubmissions.length === 0) {
        console.log("Firestore submissions collection is empty. Seeding mock data...");
        for (const mockItem of mockSubmissions) {
          try {
            await setDoc(doc(db, "submissions", mockItem.id), mockItem);
            tempSubmissions.push(mockItem);
          } catch (seedErr) {
            console.error("Failed to seed mock document:", mockItem.id, seedErr);
          }
        }
      }
      allSubmissions = tempSubmissions;
    } catch (e) {
      console.error("Firestore loading failed. Falling back to local storage:", e);
      const stored = localStorage.getItem('odamala_census_submitted');
      if (stored) {
        allSubmissions = JSON.parse(stored);
      } else {
        allSubmissions = [...mockSubmissions];
      }
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
  const valOwnerGender = document.getElementById('valOwnerGender');
  const valContact = document.getElementById('valContact');
  const valWhatsappHead = document.getElementById('valWhatsappHead');
  const valWhatsappLady = document.getElementById('valWhatsappLady');
  const valDonation = document.getElementById('valDonation');

  const valOwnership = document.getElementById('valOwnership');
  const valHouseType = document.getElementById('valHouseType');
  const valStructure = document.getElementById('valStructure');
  const valLoan = document.getElementById('valLoan');
  const valVehicles = document.getElementById('valVehicles');

  const valAssistance = document.getElementById('valAssistance');
  const valAssistanceSource = document.getElementById('valAssistanceSource');

  const detailExpatsContainer = document.getElementById('detailExpatsContainer');
  const detailNoExpats = document.getElementById('detailNoExpats');

  const detailMembersTableBody = document.getElementById('detailMembersTableBody');

  const valRemarksOwner = document.getElementById('valRemarksOwner');
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
          <button class="view-details-btn inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-brand-600 text-brand-600 hover:text-white rounded-lg text-[11px] font-bold border border-indigo-100 transition shadow-sm">
            <span>View Profile</span>
            <i class="fa-solid fa-chevron-right text-[8px]"></i>
          </button>
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

        <div class="flex justify-end pt-1">
          <button class="view-details-btn-mobile w-full flex items-center justify-center gap-1 py-2 bg-indigo-50 text-brand-600 rounded-lg text-xs font-bold border border-indigo-100 transition shadow-sm">
            <span>View Detailed Profile</span>
            <i class="fa-solid fa-chevron-right text-[9px]"></i>
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
    valOwnerGender.textContent = item.house_owner_gender || '--';
    valContact.textContent = item.contact_number || '--';
    valWhatsappHead.textContent = item.whatsapp_head || 'None';
    valWhatsappLady.textContent = item.whatsapp_senior_lady || 'None';
    valDonation.innerHTML = getDonationBadgeHTML(item.donation_status);

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

        tr.innerHTML = `
          <td class="py-3.5 px-4 font-semibold text-zinc-900">${member.name || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.relationship || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.gender || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-500 font-mono">${member.dob || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.marital_status || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.formal_education || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.educational_qualification || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-600">${member.profession || '--'}</td>
          <td class="py-3.5 px-4 text-zinc-500 font-bold">${member.blood_group || '--'}</td>
          <td class="py-3.5 px-4 text-left font-sans">${healthBadges}</td>
        `;
        detailMembersTableBody.appendChild(tr);
      });
    } else {
      detailMembersTableBody.innerHTML = `<tr><td colspan="10" class="py-4 text-center text-zinc-400 font-medium bg-zinc-50">No member bio records attached.</td></tr>`;
    }

    // Remarks
    valRemarksOwner.textContent = item.owner_remarks || 'None recorded.';
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
      'ID/Reference', 'Submitted At', 'Cluster', 'Ward', 'House Number', 'Panchayat', 'GIS Location',
      'House Name', 'Family Head', 'Owner Gender', 'Contact Number', 'WhatsApp Head', 'WhatsApp Lady',
      'Donation Status', 'Ownership', 'House Type', 'Structure', 'Loan Status', 'Vehicle Ownership',
      'Vehicle Status', 'Two Wheelers', 'Three Wheelers', 'Four Wheelers', 'Heavy Vehicles',
      'Financial Assistance', 'Assistance Source', 'Expatriates Count', 'Office Remarks', 'Verified By',
      'Member Name', 'Member Relationship', 'Member Gender', 'Member DOB', 'Member Marital Status',
      'Member Formal Education', 'Member Qualification', 'Member Profession', 'Member Blood Group', 'Member Health Status'
    ];
    
    let csvRows = [headers.join(',')];

    records.forEach(item => {
      const expatsCount = item.has_expatriates === 'Yes' && item.expatriates ? item.expatriates.length : 0;
      
      const baseCols = [
        `"${item.id || ''}"`,
        `"${item.date || item.submittedAt || ''}"`,
        `"${(item.cluster || '').replace(/"/g, '""')}"`,
        `"${item.ward_number || ''}"`,
        `"${(item.house_number || '').replace(/"/g, '""')}"`,
        `"${(item.panchayat || '').replace(/"/g, '""')}"`,
        `"${(item.gis_location || '').replace(/"/g, '""')}"`,
        `"${(item.house_name || '').replace(/"/g, '""')}"`,
        `"${(item.family_head || '').replace(/"/g, '""')}"`,
        `"${item.house_owner_gender || 'Male'}"`,
        `"${item.contact_number || ''}"`,
        `"${item.whatsapp_head || ''}"`,
        `"${item.whatsapp_senior_lady || ''}"`,
        `"${item.donation_status || ''}"`,
        `"${item.house_ownership || ''}"`,
        `"${item.house_type || ''}"`,
        `"${item.house_structure || ''}"`,
        `"${item.house_loan_status || ''}"`,
        `"${item.vehicle_ownership || 'No'}"`,
        `"${item.vehicle_status || 'N/A'}"`,
        `"${item.two_wheelers || 0}"`,
        `"${item.three_wheelers || 0}"`,
        `"${item.four_wheelers || 0}"`,
        `"${item.heavy_vehicles || 0}"`,
        `"${item.financial_assistance || ''}"`,
        `"${(item.assistance_source || '').replace(/"/g, '""')}"`,
        `"${expatsCount}"`,
        `"${(item.office_remarks || '').replace(/"/g, '""')}"`,
        `"${(item.office_verified_by || '').replace(/"/g, '""')}"`
      ];

      if (item.members && item.members.length > 0) {
        item.members.forEach(m => {
          const memberCols = [
            `"${(m.name || '').replace(/"/g, '""')}"`,
            `"${m.relationship || ''}"`,
            `"${m.gender || ''}"`,
            `"${m.dob || ''}"`,
            `"${m.marital_status || ''}"`,
            `"${m.formal_education || ''}"`,
            `"${(m.educational_qualification || '').replace(/"/g, '""')}"`,
            `"${(m.profession || '').replace(/"/g, '""')}"`,
            `"${m.blood_group || ''}"`,
            `"${(m.health_status || []).join('; ')}"`
          ];
          csvRows.push([...baseCols, ...memberCols].join(','));
        });
      } else {
        const emptyMemberCols = ['', '', '', '', '', '', '', '', '', ''];
        csvRows.push([...baseCols, ...emptyMemberCols].join(','));
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

  // Logout Event Listener
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('census_logged_in');
      sessionStorage.removeItem('census_passcode_verified');
      window.location.replace('login.html');
    });
  }

  // Load and Render
  loadSubmissions();

});
