/* ================= LOST & FOUND MANAGEMENT SYSTEM ================= */
/* ================= DATA ================= */
let items=[];
let currentUser=null;
let currentRole=null;
let loginSessionId=null;
let lostReportPhoto=null;
let foundReportPhoto=null;

/* ================= USERS ================= */
const users=[
    {
        username:"Admin",
        password:"Admin123",
        role:"Admin"
    },
    {
        username:"Finder",
        password:"Finder123",
        role:"Finder"
    },
    {
        username:"LostPerson",
        password:"Lost123",
        role:"Lost Person"
    },
    {
        username:"Staff",
        password:"Staff123",
        role:"Staff"
    }
];

try{
    const savedItems=localStorage.getItem("lostFoundItems");
    if(savedItems){
        items=JSON.parse(savedItems);
    }
}
catch(error){
    console.error("Unable to load saved items:",error);
    items=[];
}

/* ================= HISTORY ================= */
let reportHistory=[];
try{
    const savedHistory=localStorage.getItem("lostFoundHistory");
    if(savedHistory){
        reportHistory=JSON.parse(savedHistory);
    }
}
catch(error){
    console.error("Unable to load history:",error);
    reportHistory=[];
}

/* ================= SAVE HISTORY ================= */
function saveHistory(){
    try{
        localStorage.setItem("lostFoundHistory",JSON.stringify(reportHistory));
        return true;
    }
    catch(error){
        console.error("Unable to save history:",error);
        return false;
    }
}

/* ================= ADD HISTORY ================= */
function addHistory(action,item,username){
    reportHistory.push({
        id:Date.now()+Math.random(),
        action:action,
        itemId:item.id,
        itemName:item.name,
        type:item.type,
        category:item.category,
        username:username||"System",
        date:new Date().toLocaleString()
    });
    saveHistory();
}

/* ================= LOGIN ================= */
function login(event){
    event.preventDefault();
    const username=document.getElementById("username").value.trim();
    const password=document.getElementById("password").value.trim();
    const user=users.find(function(existingUser){
        return existingUser.username===username&&existingUser.password===password;
    });
    if(!user){
        alert("Invalid username or password!");
        return;
    }
    currentUser=user.username;
    currentRole=user.role;
    loginSessionId=Date.now()+Math.random();
    document.getElementById("loginPage").style.display="none";
    document.getElementById("mainApp").style.display="block";
    setupRolePermissions();
    displayItems();
    updateDashboard();
    loadDarkMode();
}

/* ================= ROLE PERMISSIONS ================= */
function setupRolePermissions(){
    const lostForm=document.querySelector('form[onsubmit="addLostItem(event)"]');
    const foundForm=document.querySelector('form[onsubmit="addFoundItem(event)"]');
    const roleDisplay=document.getElementById("currentUserRole");
    const manageUsersBtn=document.getElementById("manageUsersBtn");
    const historyBtn=document.getElementById("historyBtn");
    /* ================= GET FORM COLUMNS ================= */
    const lostColumn=lostForm?lostForm.closest(".col-lg-6"):null;
    const foundColumn=foundForm?foundForm.closest(".col-lg-6"):null;
    /* ================= RESET BOTH COLUMNS ================= */
    if(lostColumn){
        lostColumn.classList.remove("offset-lg-3");
        lostColumn.style.display="block";
    }
    if(foundColumn){
        foundColumn.classList.remove("offset-lg-3");
        foundColumn.style.display="block";
    }
    /* ================= LOST PERSON ================= */
    if(currentRole==="Lost Person"){
        if(lostColumn){
            lostColumn.style.display="block";
        }
        if(foundColumn){
            foundColumn.style.display="none";
        }
    }
    /* ================= FINDER ================= */
    else if(currentRole==="Finder"){
        if(lostColumn){
            lostColumn.style.display="none";
        }
        if(foundColumn){
            foundColumn.style.display="block";
        }
    }
    /* ================= STAFF ================= */
    else if(currentRole==="Staff"){
        if(lostColumn){
            lostColumn.style.display="none";
        }
        if(foundColumn){
            foundColumn.style.display="none";
        }
    }
    /* ================= ADMIN ================= */
    else if(currentRole==="Admin"){
        if(lostColumn){
            lostColumn.style.display="block";
        }
        if(foundColumn){
            foundColumn.style.display="block";
        }
    }
    /* ================= ROLE DISPLAY ================= */
    if(roleDisplay){
        roleDisplay.textContent=currentUser+" - "+currentRole;
    }
    /* ================= MANAGE USERS ================= */
    if(manageUsersBtn){
        manageUsersBtn.style.display=currentRole==="Admin"?"inline-block":"none";
    }
    /* ================= HISTORY ================= */
    if(historyBtn){
        historyBtn.style.display="inline-block";
    }
}

/* ================= LOGOUT ================= */
function logout(){
    currentUser=null;
    currentRole=null;
    loginSessionId=null;
    const itemsContainer=document.getElementById("itemsContainer");
    if(itemsContainer){
        itemsContainer.innerHTML="";
    }
    document.getElementById("mainApp").style.display="none";
    document.getElementById("loginPage").style.display="flex";
    document.getElementById("username").value="";
    document.getElementById("password").value="";
    document.getElementById("password").type="password";
    document.getElementById("passwordToggle").classList.remove("fa-eye");
    document.getElementById("passwordToggle").classList.add("fa-eye-slash");
}

/* ================= PASSWORD SHOW / HIDE ================= */
function togglePassword(){
    const passwordInput=document.getElementById("password");
    const passwordToggle=document.getElementById("passwordToggle");
    if(passwordInput.type==="password"){
        passwordInput.type="text";
        passwordToggle.classList.remove("fa-eye-slash");
        passwordToggle.classList.add("fa-eye");
    }
    else{
        passwordInput.type="password";
        passwordToggle.classList.remove("fa-eye");
        passwordToggle.classList.add("fa-eye-slash");
    }
}

/* ================= SAVE ITEMS ================= */
function saveItems(){
    try{
        localStorage.setItem("lostFoundItems",JSON.stringify(items));
        return true;
    }
    catch(error){
        console.error("LocalStorage Error:",error);
        return false;
    }
}

/* ================= VALIDATE DATE ================= */
function isValidDate(dateValue){
    if(!dateValue){
        return false;
    }
    const datePattern=/^\d{4}-\d{2}-\d{2}$/;
    if(!datePattern.test(dateValue)){
        return false;
    }
    const parts=dateValue.split("-");
    const year=Number(parts[0]);
    const month=Number(parts[1]);
    const day=Number(parts[2]);
    const date=new Date(year,month-1,day);
    return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day;
}

/* ================= VALIDATE PHONE ================= */
function isValidPhone(phone){
    return /^[6-9]\d{9}$/.test(String(phone).trim());
}

/* ================= REPORT PHOTO ================= */
function takeReportPhoto(type){
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";
    input.capture="environment";
    input.onchange=function(event){
        handleReportPhoto(event,type);
    };
    input.click();
}

/* ================= UPLOAD REPORT PHOTO ================= */
function uploadReportPhoto(type){
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";
    input.onchange=function(event){
        handleReportPhoto(event,type);
    };
    input.click();
}

/* ================= HANDLE REPORT PHOTO ================= */
function handleReportPhoto(event,type){
    const file=event.target.files[0];
    if(!file){
        return;
    }
    if(!file.type.startsWith("image/")){
        alert("Please select an image file.");
        return;
    }
    compressReportPhoto(file).then(function(photoData){
        if(type==="Lost"){
            lostReportPhoto=photoData;
            const status=document.getElementById("lostPhotoStatus");
            if(status){
                status.textContent="✓ Photo selected successfully.";
            }
        }
        else{
            foundReportPhoto=photoData;
            const status=document.getElementById("foundPhotoStatus");
            if(status){
                status.textContent="✓ Photo selected successfully.";
            }
        }
    }).catch(function(){
        alert("Unable to process the selected photo.");
    });
}

/* ================= COMPRESS REPORT PHOTO ================= */
function compressReportPhoto(file){
    return new Promise(function(resolve,reject){
        const reader=new FileReader();
        reader.onload=function(event){
            const image=new Image();
            image.onload=function(){
                const canvas=document.createElement("canvas");
                const maxWidth=800;
                const maxHeight=800;
                let width=image.width;
                let height=image.height;
                if(width>maxWidth){
                    height=height*(maxWidth/width);
                    width=maxWidth;
                }
                if(height>maxHeight){
                    width=width*(maxHeight/height);
                    height=maxHeight;
                }
                canvas.width=Math.round(width);
                canvas.height=Math.round(height);
                const context=canvas.getContext("2d");
                context.drawImage(image,0,0,canvas.width,canvas.height);
                resolve(canvas.toDataURL("image/jpeg",0.7));
            };
            image.onerror=function(){
                reject(new Error("Unable to load image."));
            };
            image.src=event.target.result;
        };
        reader.onerror=function(){
            reject(new Error("Unable to read image."));
        };
        reader.readAsDataURL(file);
    });
}

/* ================= ADD LOST ITEM ================= */
function addLostItem(event){
    event.preventDefault();
    if(currentRole!=="Admin"&&currentRole!=="Lost Person"){
        alert("You do not have permission to report a lost item.");
        return;
    }
    const name=document.getElementById("lostName").value.trim();
    const category=document.getElementById("lostCategory").value.trim();
    const location=document.getElementById("lostLocation").value.trim();
    const description=document.getElementById("lostDescription").value.trim();
    const personName=document.getElementById("lostPersonName").value.trim();
    const personPhone=document.getElementById("lostPersonPhone").value.trim();
    const lostDate=document.getElementById("lostDate").value;
    if(!isValidPhone(personPhone)){
        alert("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
        return;
    }
    if(!isValidDate(lostDate)){
        alert("Please select a valid Lost Date.");
        return;
    }
    if(!lostReportPhoto){
        alert("Please upload or take a photo of the lost item.");
        return;
    }
    const duplicate=items.some(function(existingItem){
        return existingItem.type==="Lost"&&existingItem.status==="Lost"&&String(existingItem.name||"").trim().toLowerCase()===name.toLowerCase()&&String(existingItem.category||"").trim().toLowerCase()===category.toLowerCase();
    });
    if(duplicate){
        alert("This lost item is already added!");
        return;
    }
    const item={
        id:Date.now(),
        type:"Lost",
        status:"Lost",
        name:name,
        category:category,
        location:location,
        description:description,
        personName:personName,
        personPhone:personPhone,
        lostDate:lostDate,
        itemPhoto:lostReportPhoto,
        ownerUsername:currentUser,
        ownerRole:currentRole,
        editSessionId:loginSessionId,
        date:new Date().toLocaleString()
    };
    items.push(item);
    const saved=saveItems();
    if(!saved){
        items.pop();
        alert("Unable to save the report. Please try again.");
        return;
    }
    addHistory("Reported Lost Item",item,currentUser);
    event.target.reset();
    lostReportPhoto=null;
    const photoStatus=document.getElementById("lostPhotoStatus");
    if(photoStatus){
        photoStatus.textContent="No photo selected.";
    }
    displayItems();
    updateDashboard();
    alert("Lost item reported successfully!");
}

/* ================= ADD FOUND ITEM ================= */
function addFoundItem(event){
    event.preventDefault();
    if(currentRole!=="Admin"&&currentRole!=="Finder"){
        alert("You do not have permission to report a found item.");
        return;
    }
    const name=document.getElementById("foundName").value.trim();
    const category=document.getElementById("foundCategory").value.trim();
    const location=document.getElementById("foundLocation").value.trim();
    const description=document.getElementById("foundDescription").value.trim();
    const personName=document.getElementById("foundPersonName").value.trim();
    const personPhone=document.getElementById("foundPersonPhone").value.trim();
    const foundDate=document.getElementById("foundDate").value;
    if(!isValidPhone(personPhone)){
        alert("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
        return;
    }
    if(!isValidDate(foundDate)){
        alert("Please select a valid Found Date.");
        return;
    }
    if(!foundReportPhoto){
        alert("Please upload or take a photo of the found item.");
        return;
    }
    const duplicate=items.some(function(existingItem){
        return existingItem.type==="Found"&&existingItem.status==="Found"&&String(existingItem.name||"").trim().toLowerCase()===name.toLowerCase()&&String(existingItem.category||"").trim().toLowerCase()===category.toLowerCase();
    });
    if(duplicate){
        alert("This found item is already added!");
        return;
    }
    const item={
        id:Date.now(),
        type:"Found",
        status:"Found",
        name:name,
        category:category,
        location:location,
        description:description,
        personName:personName,
        personPhone:personPhone,
        foundDate:foundDate,
        itemPhoto:foundReportPhoto,
        ownerUsername:currentUser,
        ownerRole:currentRole,
        editSessionId:loginSessionId,
        date:new Date().toLocaleString()
    };
    items.push(item);
    const saved=saveItems();
    if(!saved){
        items.pop();
        alert("Unable to save the report. Please try again.");
        return;
    }
    addHistory("Reported Found Item",item,currentUser);
    event.target.reset();
    foundReportPhoto=null;
    const photoStatus=document.getElementById("foundPhotoStatus");
    if(photoStatus){
        photoStatus.textContent="No photo selected.";
    }
    displayItems();
    updateDashboard();
    alert("Found item reported successfully!");
}

/* ================= DASHBOARD ================= */
function updateDashboard(){
    const lostItems=items.filter(function(item){
        return item.type==="Lost"&&item.status!=="Returned";
    });
    const foundItems=items.filter(function(item){
        return item.type==="Found"&&item.status==="Found";
    });
    const returnedItems=items.filter(function(item){
        return item.status==="Returned";
    });
    document.getElementById("lostCount").textContent=lostItems.length;
    document.getElementById("foundCount").textContent=foundItems.length;
    document.getElementById("returnedCount").textContent=returnedItems.length;
}

/* ================= ESCAPE HTML ================= */
function escapeHTML(value){
    if(value===null||value===undefined){
        return "";
    }
    return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

/* ================= CAN EDIT ITEM ================= */
function canEditItem(item){
    if(!currentUser||!currentRole){
        return false;
    }
    if(!loginSessionId){
        return false;
    }
    if(item.status==="Returned"){
        return false;
    }
    if(item.editSessionId!==loginSessionId){
        return false;
    }
    if(currentRole==="Admin"){
        return true;
    }
    if(currentRole==="Finder"){
        return item.type==="Found"&&item.status==="Found"&&item.ownerUsername===currentUser&&item.ownerRole==="Finder";
    }
    if(currentRole==="Lost Person"){
        return item.type==="Lost"&&item.status==="Lost"&&item.ownerUsername===currentUser&&item.ownerRole==="Lost Person";
    }
    return false;
}

/* ================= EDIT BUTTON ================= */
function getEditButton(item){
    if(!canEditItem(item)){
        return "";
    }
    if(item.status==="Returned"){
        return "";
    }
    return `
        <button type="button" class="btn btn-primary" onclick="editItem(${item.id})">
            <i class="fa-solid fa-pen"></i>
            Edit
        </button>
    `;

}
/* ================= DELETE BUTTON ================= */
/* ================= Admin ONLY ================= */
function getDeleteButton(item){
    if(currentRole!=="Admin"){
        return "";
    }
    if(item.status==="Returned"){
        return "";
    }
    return `
        <button type="button" class="btn btn-danger" onclick="deleteItem(${item.id})">
            <i class="fa-solid fa-trash"></i>
            Delete
        </button>
    `;
}

/* ================= ACTION BUTTONS ================= */
function getActionButtons(item){
    const editButton=getEditButton(item);
    const deleteButton=getDeleteButton(item);
    if(!editButton&&!deleteButton){
        return "";
    }
    return `
        <div class="item-action-buttons">
            ${editButton}
            ${deleteButton}
        </div>
    `;
}

/* ================= DISPLAY ITEMS ================= */
function displayItems(){
    const container=document.getElementById("itemsContainer");
    const searchInput=document.getElementById("searchInput");
    const search=searchInput?searchInput.value.toLowerCase().trim():"";
    const filter=localStorage.getItem("selectedFilter")||"All";
    container.innerHTML="";
    let filteredItems=items.filter(function(item){
        let filterMatch=true;
        if(filter==="Lost"){
            filterMatch=item.type==="Lost"&&item.status!=="Returned";
        }
        else if(filter==="Found"){
            filterMatch=item.type==="Found"&&item.status==="Found";
        }
        else if(filter==="Returned"){
            filterMatch=item.status==="Returned";
        }
        const searchMatch=String(item.name||"").toLowerCase().includes(search)||String(item.category||"").toLowerCase().includes(search)||String(item.location||"").toLowerCase().includes(search)||String(item.personName||"").toLowerCase().includes(search)||String(item.lostPersonName||"").toLowerCase().includes(search)||String(item.description||"").toLowerCase().includes(search);
        return filterMatch&&searchMatch;
    });
    filteredItems.sort(function(a,b){
        function getOrder(item){
            if(item.type==="Lost"&&item.status!=="Returned"){
                return 1;
            }
            if(item.type==="Found"&&item.status==="Found"){
                return 2;
            }
            if(item.status==="Returned"){
                return 3;
            }
            return 4;
        }
        return getOrder(a)-getOrder(b);
    });
    if(filteredItems.length===0){
        container.innerHTML=`
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fa-solid fa-circle-info"></i>No items found.
                </div>
            </div>
        `;
        return;
    }
    filteredItems.forEach(function(item){
        let badge;
        if(item.status==="Returned"){
            badge="success";
        }
        else if(item.type==="Found"){
            badge="warning";
        }
        else{
            badge="danger";
        }
        let badgeText;
        if(item.status==="Returned"){
            badgeText="Returned";
        }
        else{
            badgeText=item.type;
        }
        let returnPhoto="";
        if(item.status==="Returned"&&item.returnPhoto){
            returnPhoto=`
                <div class="mt-3">
                    <strong>Return Photo: </strong><br>
                    <img src="${item.returnPhoto}" class="return-photo rounded mt-2" alt="Returned Item Photo">
                </div>
            `;
        }
        let claimButton="";
        if(item.type==="Found"&&item.status==="Found"&&(currentRole==="Admin"||currentRole==="Staff")){
            claimButton=`
                <button type="button" class="btn btn-warning mt-3 w-100" onclick="claimItem(${item.id})">
                    <i class="fa-solid fa-hand"></i>Claim Item
                </button>
            `;
        }
        const actionButtons=getActionButtons(item);
        if(item.status==="Returned"){
            container.innerHTML+=`
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <strong>Lost Item:${escapeHTML(item.name)}</strong><span class="badge bg-success">Returned</span>
                        </div>
                        <div class="card-body">
                            <p class="mb-2">
                                <strong>Lost Person Name: </strong>${escapeHTML(item.lostPersonName||"Not Available")}
                            </p>
                            <p class="mb-2">
                                <strong>Finder Name: </strong>${escapeHTML(item.personName||"Not Available")}
                            </p>
                            <div class="returned-details mt-3 p-3 rounded">
                                <h6 class="text-success"><i class="fa-solid fa-user-check"></i>Returned Details</h6>
                                <hr>
                                    <h6>👤 Lost Person Details</h6>
                                    <p class="mb-2">
                                        <strong>Name: </strong>${escapeHTML(item.lostPersonName||"Not Available")}
                                    </p>
                                    <p class="mb-2">
                                        <strong>Phone: </strong>${escapeHTML(item.lostPersonPhone||"Not Available")}
                                    </p>
                                    <p class="mb-2">
                                        <strong>Lost Location: </strong>${escapeHTML(item.lostLocation||"Not Available")}
                                    </p>
                                    <p class="mb-2">
                                        <strong>Lost Date: </strong>${escapeHTML(formatDate(item.lostDate)||"Not Available")}
                                    </p>
                                <hr>
                                <h6>🔎 Finder Details</h6>
                                <p class="mb-2">
                                    <strong>Name: </strong>${escapeHTML(item.personName||"Not Available")}
                                </p>
                                <p class="mb-2">
                                    <strong>Phone: </strong>${escapeHTML(item.personPhone||"Not Available")}
                                </p>
                                <p class="mb-2">
                                    <strong>Found Location: </strong>${escapeHTML(item.location||"Not Available")}
                                </p>
                                <p class="mb-2">
                                    <strong>Found Date: </strong>${escapeHTML(formatDate(item.foundDate)||"Not Available")}
                                </p>
                                <hr>
                                <p class="mb-0">
                                    <strong>Returned Date: </strong>${escapeHTML(item.returnedDate||"Not Available")}
                                </p>
                            </div>
                            ${returnPhoto}
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        const itemPhoto=item.itemPhoto?`
                <div class="mt-3">
                    <strong>Item Photo: </strong><br>
                    <img src="${item.itemPhoto}" class="return-photo rounded mt-2" alt="Item Photo">
                </div>
            `:"";
        const description=item.description?`
                <p class="mb-1">
                    <strong>Description: </strong>${escapeHTML(item.description)}
                </p>
            `:"";
        container.innerHTML+=`
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>${escapeHTML(item.name)}</strong>
                        <span class="badge bg-${badge}">${badgeText}</span>
                    </div>
                    <div class="card-body">
                        <p class="mb-1">
                            <strong>Category: </strong>${escapeHTML(item.category)}
                        </p>
                        <p class="mb-1">
                            <strong>Location: </strong>${escapeHTML(item.location)}
                        </p>
                        ${description}
                        <p class="mb-1">
                            <strong>${item.type==="Found"?"Finder Name":"Person Name"}: </strong>${escapeHTML(item.personName)}
                        </p>
                        <p class="mb-1">
                            <strong>Phone: </strong>${escapeHTML(item.personPhone)}
                        </p>
                        <p class="mb-1">
                            <strong>${item.type==="Found"?"Found Date":"Lost Date"}: </strong>${escapeHTML(formatDate(item.type==="Found"?item.foundDate:item.lostDate))}
                        </p>
                        ${itemPhoto}
                        ${claimButton}
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    });
}

/* ================= EDIT ITEM ================= */
function editItem(itemId){
    const item=items.find(function(existingItem){
        return existingItem.id===itemId;
    });
    if(!item){
        alert("Item not found.");
        return;
    }
    if(!canEditItem(item)){
        alert("You can edit only your own report.");
        return;
    }
    if(item.status==="Returned"){
        alert("Returned items cannot be edited.");
        return;
    }
    /* ================= DARK MODE CHECK ================= */
    const isDarkMode=document.body.classList.contains("dark-mode");
    const popupBackground=isDarkMode?"#212529":"white";
    const popupTextColor=isDarkMode?"white":"#212529";
    const inputBackground=isDarkMode?"#343a40":"white";
    const inputTextColor=isDarkMode?"white":"#212529";
    const inputBorderColor=isDarkMode?"#6c757d":"#dee2e6";
    /* ================= EDIT POPUP ================= */
    const popup=document.createElement("div");
    popup.className="edit-item-popup";
    const personLabel=item.type==="Found"?"Finder Name":"Person Name";
    const dateLabel=item.type==="Found"?"Found Date":"Lost Date";
    const oldDate=item.type==="Found"?item.foundDate:item.lostDate;
    popup.innerHTML=`
        <div class="edit-item-popup-box" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: ${popupBackground}; color: ${popupTextColor}; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 10px; box-shadow: 0 5px 30px rgba(0,0,0,0.3); z-index: 9999;">
            <h5 class="mb-3"><i class="fa-solid fa-pen"></i>Edit Item</h5>
            <div class="mb-3">
                <label class="form-label">Item Name</label>
                <input type="text" id="editItemName" class="form-control" value="${escapeHTML(item.name||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">Category</label>
                <input type="text" id="editItemCategory" class="form-control" value="${escapeHTML(item.category||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">Location</label>
                <input type="text" id="editItemLocation" class="form-control" value="${escapeHTML(item.location||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea id="editItemDescription" class="form-control" rows="3" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">${escapeHTML(item.description||"")}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">${personLabel}</label>
                <input type="text" id="editItemPersonName" class="form-control" value="${escapeHTML(item.personName||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">Phone</label>
                <input type="text" id="editItemPhone" class="form-control" value="${escapeHTML(item.personPhone||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">${dateLabel}</label>
                <input type="date" id="editItemDate" class="form-control" value="${escapeHTML(oldDate||"")}" style="background: ${inputBackground}; color: ${inputTextColor}; border-color: ${inputBorderColor};">
            </div>
            <div class="mb-3">
                <label class="form-label">Uploaded Item Photo</label><br>
                ${item.itemPhoto?`<img src="${item.itemPhoto}" alt="Current Item Photo" style="width: 150px; max-width: 100%; border-radius: 8px; margin-top: 5px;">`:`<p>No photo available.</p>`}
            </div>
            <div class="mb-3">
                <button type="button" id="editChangePhotoBtn" class="btn btn-secondary">
                    <i class="fa-solid fa-camera"></i>Change Uploaded Item Photo
                </button>
            </div>
            <div id="editPhotoStatus" class="mb-3">
                Existing photo will be kept unless changed.
            </div>
            <div class="d-flex gap-2">
                <button type="button" id="saveEditedItemBtn" class="btn btn-primary">
                    <i class="fa-solid fa-floppy-disk"></i>Save Changes
                </button>
                <button type="button" id="cancelEditedItemBtn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    `;
    /* ================= BACKGROUND ================= */
    popup.style.position="fixed";
    popup.style.top="0";
    popup.style.left="0";
    popup.style.width="100%";
    popup.style.height="100%";
    popup.style.background="rgba(0,0,0,0.5)";
    popup.style.zIndex="9998";
    document.body.appendChild(popup);
    /* ================= PHOTO CHANGE ================= */
    let newPhoto=null;
    document.getElementById("editChangePhotoBtn").addEventListener("click",function(){
        const changePhoto=confirm("Do you want to change the uploaded item photo?");
        if(!changePhoto){
            return;
        }
        const photoPopup=document.createElement("div");
        photoPopup.style.position="fixed";
        photoPopup.style.top="0";
        photoPopup.style.left="0";
        photoPopup.style.width="100%";
        photoPopup.style.height="100%";
        photoPopup.style.background="rgba(0,0,0,0.5)";
        photoPopup.style.zIndex="10000";
        photoPopup.innerHTML=`
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: ${popupBackground}; color: ${popupTextColor}; width: 90%; max-width: 400px; padding: 25px; border-radius: 10px; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <h5 class="mb-3">Change Item Photo</h5>
                    <button type="button" id="editTakePhotoBtn" class="btn btn-primary w-100 mb-2">📷 Take Photo</button>
                    <button type="button" id="editUploadPhotoBtn" class="btn btn-success w-100 mb-2">🖼️ Upload Photo</button>
                    <button type="button" id="editCancelPhotoBtn" class="btn btn-secondary w-100">Cancel</button>
                </div>
            `;
        document.body.appendChild(photoPopup);
        /* ================= TAKE PHOTO ================= */
        document.getElementById("editTakePhotoBtn").addEventListener("click",function(){
            const input=document.createElement("input");
            input.type="file";
            input.accept="image/*";
            input.setAttribute("capture","environment");
            input.addEventListener("change",function(event){
                const file=event.target.files&&event.target.files[0];
                if(!file){
                    return;
                }
                if(!file.type.startsWith("image/")){
                    alert("Please select an image file.");
                    return;
                }
                compressReportPhoto(file).then(function(photoData){
                    newPhoto=photoData;
                    document.getElementById("editPhotoStatus").textContent="✓ New photo selected successfully.";
                    photoPopup.remove();
                }).catch(function(){
                    alert("Unable to process the selected photo.");
                });
            });
            document.body.appendChild(input);
            input.click();
            setTimeout(function(){
                if(input.parentNode){
                    input.parentNode.removeChild(input);
                }
            },5000);
        });
        /* ================= UPLOAD PHOTO ================= */
        document.getElementById("editUploadPhotoBtn").addEventListener("click",function(){
            const input=document.createElement("input");
            input.type="file";
            input.accept="image/*";
            input.addEventListener("change",function(event){
                const file=event.target.files&&event.target.files[0];
                if(!file){
                    return;
                }
                if(!file.type.startsWith("image/")){
                    alert("Please select an image file.");
                    return;
                }
                compressReportPhoto(file).then(function(photoData){
                    newPhoto=photoData;
                    document.getElementById("editPhotoStatus").textContent="✓ New photo selected successfully.";
                    photoPopup.remove();
                }).catch(function(){
                    alert("Unable to process the selected photo.");
                });
            });
            document.body.appendChild(input);
            input.click();
            setTimeout(function(){
                if(input.parentNode){
                    input.parentNode.removeChild(input);
                }
            },5000);
        });
        /* ================= CANCEL PHOTO CHANGE ================= */
        document.getElementById("editCancelPhotoBtn").addEventListener("click",function(){
            photoPopup.remove();
        });
    });
    /* ================= SAVE EDITED ITEM ================= */
    document.getElementById("saveEditedItemBtn").addEventListener("click",function(){
        const newName=document.getElementById("editItemName").value.trim();
        const newCategory=document.getElementById("editItemCategory").value.trim();
        const newLocation=document.getElementById("editItemLocation").value.trim();
        const newDescription=document.getElementById("editItemDescription").value.trim();
        const newPersonName=document.getElementById("editItemPersonName").value.trim();
        const newPhone=document.getElementById("editItemPhone").value.trim();
        const newDate=document.getElementById("editItemDate").value.trim();
        /* ================= VALIDATION ================= */
        if(!newName){
            alert("Please enter Item Name.");
            return;
        }
        if(!newCategory){
            alert("Please enter Category.");
            return;
        }
        if(!newLocation){
            alert("Please enter Location.");
            return;
        }
        if(!newPersonName){
            alert("Please enter "+personLabel+".");
            return;
        }
        if(!isValidPhone(newPhone)){
            alert("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
            return;
        }
        if(!isValidDate(newDate)){
            alert("Please select a valid "+dateLabel+".");
            return;
        }
        /* ================= DUPLICATE CHECK ================= */
        const duplicate=items.some(function(existingItem){
            if(existingItem.id===item.id){
                return false;
            }
            return existingItem.type===item.type&&existingItem.status===item.status&&String(existingItem.name||"").trim().toLowerCase()===newName.toLowerCase()&&String(existingItem.category||"").trim().toLowerCase()===newCategory.toLowerCase();
        });
        if(duplicate){
            alert("Another item with the same name and category already exists!");
            return;
        }
        /* ================= UPDATE ITEM ================= */
        item.name=newName;
        item.category=newCategory;
        item.location=newLocation;
        item.description=newDescription;
        item.personName=newPersonName;
        item.personPhone=newPhone;
        if(item.type==="Found"){
            item.foundDate=newDate;
        }
        else{
            item.lostDate=newDate;
        }
        /* ================= REPLACE PHOTO ONLY IF NEW PHOTO ================= */
        if(newPhoto){
            item.itemPhoto=newPhoto;
        }
        item.lastEditedBy=currentUser;
        item.lastEditedDate=new Date().toLocaleString();
        const saved=saveItems();
        if(!saved){
            alert("Unable to save the report. Please try again.");
            return;
        }
        addHistory("Edited Report",item,currentUser);
        popup.remove();
        displayItems();
        updateDashboard();
        alert("Report updated successfully!");
    });
    /* ================= CANCEL EDIT ================= */
    document.getElementById("cancelEditedItemBtn").addEventListener("click",function(){
        popup.remove();
    });
}

/* ================= DELETE ITEM ================= */
/* ================= ADMIN ONLY ================= */
function deleteItem(itemId){
    if(currentRole!=="Admin"){
        alert("Only Admin can delete reports.");
        return;
    }
    const index=items.findIndex(function(item){
        return item.id===itemId;
    });
    if(index===-1){
        alert("Item not found.");
        return;
    }
    const item=items[index];
    if(item.status==="Returned"){
        alert("Returned items cannot be deleted.");
        return;
    }
    const confirmed=confirm("Are you sure you want to delete this report?\n\n"+"Item: "+item.name+"\n"+"Type: "+item.type);
    if(!confirmed){
        return;
    }
    items.splice(index,1);
    saveItems();
    addHistory("Deleted Report",item,currentUser);
    displayItems();
    updateDashboard();
    alert("Report deleted successfully!");
}

/* ================= REPORT HISTORY ================= */
function showReportHistory(){
    let history;
    if(currentRole==="Admin"||currentRole==="Staff"){
        history=reportHistory.slice();
    }
    else{
        history=reportHistory.filter(function(historyItem){
            return historyItem.username===currentUser;
        });
    }
    history.reverse();
    const popup=document.createElement("div");
    popup.className="history-popup";
    let historyHTML="";
    if(history.length===0){
        historyHTML=`
            <div class="alert alert-info text-center">
                No report history found.
            </div>
        `;
    }
    else{
        history.forEach(function(historyItem){
            let badge="primary";
            if(historyItem.action.includes("Deleted")){
                badge="danger";
            }
            else if(historyItem.action.includes("Edited")){
                badge="warning";
            }
            else if(historyItem.action.includes("Returned")){
                badge="success";
            }
            historyHTML+=`
                    <div class="history-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong>${escapeHTML(historyItem.action)}</strong>
                            <span class="badge bg-${badge}">${escapeHTML(historyItem.type)}</span>
                        </div>
                        <hr>
                        <p class="mb-1">
                            <strong>Item: </strong>${escapeHTML(historyItem.itemName)}
                        </p>
                        <p class="mb-1">
                            <strong>Category: </strong>${escapeHTML(historyItem.category)}
                        </p>
                        <p class="mb-1">
                            <strong>User: </strong>${escapeHTML(historyItem.username)}
                        </p>
                        <p class="mb-0">
                            <strong>Date: </strong>${escapeHTML(historyItem.date)}
                        </p>
                    </div>
                `;
        });
    }
    popup.innerHTML=`
        <div class="history-popup-box" style="position: relative;">
            <button type="button" onclick="closeHistoryPopup()" aria-label="Close History" style="position: absolute; top: 10px; right: 12px; border: none; background: transparent; font-size: 24px; line-height: 1; cursor: pointer; color: inherit;">✕</button>
            <h5><i class="fa-solid fa-clock-rotate-left"></i>Report History</h5>
            ${historyHTML}
            <button type="button" class="btn btn-secondary w-100 mt-3" onclick="closeHistoryPopup()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
}

/* ================= CLOSE HISTORY ================= */
function closeHistoryPopup(){
    const popup=document.querySelector(".history-popup");
    if(popup){
        popup.remove();
    }
}

/* ================= MANAGE USERS ================= */
/* ================= ADMIN ONLY ================= */
function manageUsers(){
    if(currentRole!=="Admin"){
        alert("Only Admin can manage users.");
        return;
    }
    let userList="";
    users.forEach(function(user){
        userList+=user.username+" - "+user.role+"\n";
    });
    alert("Registered Users\n\n"+userList);
}

/* ================= FORMAT DATE ================= */
function formatDate(dateValue){
    if(!dateValue){
        return "";
    }
    const parts=String(dateValue).split("-");
    if(parts.length===3){
        return parts[2]+"/"+parts[1]+"/"+parts[0];
    }
    return dateValue;
}

/* ================= CLAIM ITEM ================= */
function claimItem(itemId){
    if(currentRole!=="Admin"&&currentRole!=="Staff"){
        alert("Only Admin or Staff can claim/return an item.");
        return;
    }
    const item=items.find(function(foundItem){
        return foundItem.id===itemId;
    });
    if(!item){
        alert("Item not found.");
        return;
    }
    const foundItemName=String(item.name||"").toLowerCase().trim();
    const foundItemCategory=String(item.category||"").toLowerCase().trim();
    const lostIndex=items.findIndex(function(lostItem){
        if(lostItem.type!=="Lost"||lostItem.status==="Returned"){
            return false;
        }
        const lostItemName=String(lostItem.name||"").toLowerCase().trim();
        const lostItemCategory=String(lostItem.category||"").toLowerCase().trim();
        return lostItemName===foundItemName&&lostItemCategory===foundItemCategory;
    });
    if(lostIndex===-1){
        alert("No matching lost item found.\n\n"+"This item cannot be returned.");
        return;
    }
    const popup=document.createElement("div");
    popup.className="claim-popup";
    popup.innerHTML=`
        <div class="claim-popup-box">
            <h5><i class="fa-solid fa-hand"></i>Claim Item
            </h5>
            <p class="popup-text">
                Matching lost item found.<br>
                Choose how you want to add the return photo.
            </p>
            <button type="button" class="btn btn-primary w-100 mb-2" onclick="takePhoto(${item.id})">📷 Take Photo</button>
            <button type="button" class="btn btn-success w-100 mb-2" onclick="uploadPhoto(${item.id})">🖼️ Upload Photo</button>
            <button type="button" class="btn btn-secondary w-100" onclick="closeClaimPopup()">Cancel</button>
        </div>
    `;
    document.body.appendChild(popup);
}

/* ================= CLOSE CLAIM POPUP ================= */
function closeClaimPopup(){
    const popup=document.querySelector(".claim-popup");
    if(popup){
        popup.remove();
    }
}

/* ================= TAKE PHOTO ================= */
function takePhoto(itemId){
    const item=items.find(function(foundItem){
        return foundItem.id===itemId;
    });
    if(!item){
        return;
    }
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";
    input.capture="environment";
    input.onchange=function(event){
        const file=event.target.files[0];
        if(!file){
            return;
        }
        const popup=document.querySelector(".claim-popup");
        saveReturnPhoto(item,file,popup);
    };
    input.click();
}

/* ================= UPLOAD PHOTO ================= */
function uploadPhoto(itemId){
    const item=items.find(function(foundItem){
        return foundItem.id===itemId;
    });
    if(!item){
        return;
    }
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";
    input.onchange=function(event){
        const file=event.target.files[0];
        if(!file){
            return;
        }
        const popup=document.querySelector(".claim-popup");
        saveReturnPhoto(item,file,popup);
    };
    input.click();
}

/* ================= SAVE RETURN PHOTO ================= */
function saveReturnPhoto(item,file,popup){
    if(!file){
        alert("Please select a photo.");
        return;
    }
    if(!file.type.startsWith("image/")){
        alert("Please select an image file.");
        return;
    }
    const reader=new FileReader();
    reader.onload=function(event){
        const image=new Image();
        image.onload=function(){
            const canvas=document.createElement("canvas");
            const maxWidth=800;
            const maxHeight=800;
            let width=image.width;
            let height=image.height;
            if(width>maxWidth){
                height=height*(maxWidth/width);
                width=maxWidth;
            }
            if(height>maxHeight){
                width=width*(maxHeight/height);
                height=maxHeight;
            }
            canvas.width=Math.round(width);
            canvas.height=Math.round(height);
            const context=canvas.getContext("2d");
            context.drawImage(image,0,0,canvas.width,canvas.height);
            const compressedPhoto=canvas.toDataURL("image/jpeg",0.7);
            const foundItemName=String(item.name||"").toLowerCase().trim();
            const foundItemCategory=String(item.category||"").toLowerCase().trim();
            const lostIndex=items.findIndex(function(lostItem){
                if(lostItem.type!=="Lost"||lostItem.status==="Returned"){
                    return false;
                }
                const lostItemName=String(lostItem.name||"").toLowerCase().trim();
                const lostItemCategory=String(lostItem.category||"").toLowerCase().trim();
                return lostItemName===foundItemName&&lostItemCategory===foundItemCategory;
            });
            if(lostIndex===-1){
                if(popup){
                    popup.remove();
                }
                alert("No matching lost item found.\n\n"+"This item cannot be returned.");
                return;
            }
            const lostItem=items[lostIndex];
            item.lostPersonName=lostItem.personName;
            item.lostPersonPhone=lostItem.personPhone;
            item.lostLocation=lostItem.location;
            item.lostDate=lostItem.lostDate;
            item.returnPhoto=compressedPhoto;
            item.status="Returned";
            item.returnedDate=new Date().toLocaleString();
            item.returnedBy=currentUser;
            items.splice(lostIndex,1);
            const saved=saveItems();
            if(!saved){
                alert("Unable to save the photo. "+"Please try a smaller image.");
                return;
            }
            addHistory("Returned Item",item,currentUser);
            if(popup){
                popup.remove();
            }
            displayItems();
            updateDashboard();
            alert("Photo uploaded successfully!\n\n"+"Item matched with a lost item "+"and marked as Returned.");
        };
        image.onerror=function(){
            alert("Unable to load the selected photo.");
        };
        image.src=event.target.result;
    };
    reader.onerror=function(){
        alert("Unable to read the selected photo.");
    };
    reader.readAsDataURL(file);
}

/* ================= FILTER MENU ================= */
function toggleFilterMenu(){
    const filterMenu=document.getElementById("filterMenu");
    filterMenu.classList.toggle("show");
}

/* ================= SELECT FILTER ================= */
function selectFilter(filter){
    localStorage.setItem("selectedFilter",filter);
    displayItems();
    const filterMenu=document.getElementById("filterMenu");
    filterMenu.classList.remove("show");
}

/* ================= CLOSE FILTER WHEN CLICKING OUTSIDE ================= */
document.addEventListener("click",function(event){
    const filterWrapper=document.querySelector(".filter-wrapper");
    const filterMenu=document.getElementById("filterMenu");
    if(filterWrapper&&filterMenu&&!filterWrapper.contains(event.target)){
        filterMenu.classList.remove("show");
    }
});

/* ================= DARK MODE ================= */
function toggleDarkMode(){
    const darkMode=document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode",darkMode?"enabled":"disabled");
    updateDarkModeButtons();
}

/* ================= UPDATE DARK MODE BUTTONS ================= */
function updateDarkModeButtons(){
    const darkMode=document.body.classList.contains("dark-mode");
    const loginButton=document.getElementById("loginDarkModeBtn");
    const mainButton=document.getElementById("darkModeBtn");
    if(loginButton){
        loginButton.innerHTML=darkMode?"☀️ Light Mode":"🌙 Dark Mode";
    }
    if(mainButton){
        mainButton.innerHTML=darkMode?"☀️ Light Mode":"🌙 Dark Mode";
    }
}

/* ================= LOAD DARK MODE ================= */
function loadDarkMode(){
    const darkMode=localStorage.getItem("darkMode");
    if(darkMode==="enabled"){
        document.body.classList.add("dark-mode");
    }
    else{
        document.body.classList.remove("dark-mode");
    }
    updateDarkModeButtons();
}

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded",function(){
    if(!localStorage.getItem("selectedFilter")){
        localStorage.setItem("selectedFilter","All");
    }
    loadDarkMode();
});