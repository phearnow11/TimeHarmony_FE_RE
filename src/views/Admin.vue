<template>
  <div v-if="checkAdmin(authStore.user_id)" >

  <div class="h-screen">
    <div v-if="isLoading" class="overlay">
      <div class="loader-container">
        <div class="loader">
          <div class="loaderBar"></div>
        </div>
      </div>
    </div>
    
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-80 bg-black-99 text-white p-4 overflow-y-auto border-r border-gray-99">
        <nav>
        <div class="flex text-xl justify-center p-5 w-full">
          <div class="text-primary text-center text-2xl">Quản trị viên Time Harmony</div>
        </div>
        <h1 class="text-xl flex justify-center text-primary font-bold mb-4">Bảng Điều Khiển Quản Trị</h1>
        <ul class="p-6">
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'profit-overview'" 
            :class="{'text-primary': currentSection === 'profit-overview'}">
            Tổng Quan Thông Tin
          </a>
        </li>
        <li class="mb-4">
          <a href="#" @click.prevent="currentSection = 'pending-products'"
             :class="{'text-primary': currentSection === 'pending-products'}">
            Danh Sách Chờ Duyệt
          </a>
        </li>
        <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'member-list'"
               :class="{'text-primary': currentSection === 'member-list'}">
              Danh Sách Người Dùng
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'seller-list'"
               :class="{'text-primary': currentSection === 'seller-list'}">
              Danh Sách Người Đăng Bán
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'staff-list'"
               :class="{'text-primary': currentSection === 'staff-list'}">
              Danh Sách Nhân Viên
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'products'"
               :class="{'text-primary': currentSection === 'products'}">
               Danh Sách Đồng Hồ
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'orders'"
               :class="{'text-primary': currentSection === 'orders'}">
              Đơn Hàng
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'shipping'"
               :class="{'text-primary': currentSection === 'shipping'}">
              Phân đơn cho shipper
            </a>
          </li>
          <li class="mb-4">
            <a href="#" @click.prevent="currentSection = 'refund-transactions'"
               :class="{'text-primary': currentSection === 'refund-transactions'}">
              Giao dịch cần hoàn tiền
            </a>
          </li>
        </ul>
      </nav>
      <div class="w-full flex justify-center items-center">
        <a href="/chat">
          <span class="mdi mdi-message-text-outline hover-underline-animation cursor-pointer"> Tin nhắn</span>
          <span class="absolute top-5 newmessnoti text-blue-400" v-if="useChatStore().haveNewMessage">●</span>
        </a>
        <span class="mx-4">|</span>
        <span @click="logout" class="hover-underline-animation cursor-pointer">
          <i class="fa fa-sign-out"></i> Đăng xuất
        </span>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-y-auto">
      <!-- Tổng quan lợi nhuận -->
      <section v-if="currentSection === 'profit-overview'" class="mb-6">
        <div class="w-full flex justify-center p-2">
          <h2 class="text-2xl font-semibold mb-4">Tổng Quan Thông Tin</h2>
        </div>
        <div class="back w-full p-1 rounded-lg shadow mb-5">
            <h2 class="flex text-2xl font-semibold justify-center">Top 3 Hãng Được Đăng Bán Nhiều Nhất</h2>
            <ol>
              <li class="w-full flex justify-center p-1 text-xl" v-for="(item, index) in topThreeWatch" :key="item.brand">
                {{ index + 1 }}. {{ item.brand }} - {{ item[""] }} chiếc
              </li>
            </ol>
        </div>

        <div class="mb-4">
          <label for="month-select" class="mr-2">Chọn tháng:</label>
          <input 
            type="month"
            id="month-select" 
            v-model="selectedMonth" 
            @change="updateOrderStats"
            class="p-2 border bg-black-99 rounded"
          >
        </div>
       
        <div class="grid grid-cols-3 gap-4 mt-5 mb-6">
          <div class="back p-4 rounded-lg shadow">
            <p class="text-xl font-medium">Số lượng đơn đặt thành công: {{ numSuccessOrder }}</p>
          </div>
          <div class="back p-4 rounded-lg shadow">
            <p class="text-xl font-medium">Số tiền trang web giữ: {{ currency(totalAmountOrder) }}</p>
          </div>
          <div class="back p-4 rounded-lg shadow">
            <p class="text-xl font-medium">Lợi Nhuận Tổng: {{ currency(totalAmountProfit) }}</p>
          </div>
        </div>
        <div class="w-full flex justify-center p-5">
          <h2 class="text-2xl font-semibold mb-4">Tổng Quan Lợi Nhuận</h2>
        </div>
        <div v-if="showCharts" class="gap-6 mb-6">
          <div>
            <div class="flex items-center space-x-4 mb-4">
              <div>
                <label for="startDate" class="block text-sm font-medium ">Từ ngày:</label>
                <input 
                  type="date" 
                  id="startDate" 
                  v-model="startDate" 
                  :max="endDate"
                  @change="updateChart"
                  class="p-2 border bg-black-99 rounded"
                >
              </div>
              <div>
                <label for="endDate" class="block text-sm font-medium ">Đến ngày:</label>
                <input 
                  type="date" 
                  id="endDate" 
                  v-model="endDate" 
                  :min="startDate"
                  :max="new Date().toISOString().split('T')[0]"
                  @change="updateChart"
                  class="p-2 border bg-black-99 rounded"
                >
              </div>
            </div>
            <div class="back p-4 rounded-lg shadow">
              <canvas ref="monthlyRevenueChart"></canvas>
            </div>
          </div>
          <div class="flex items-center space-x-4 my-5">
            <label class="mr-3 block text-sm font-medium " for="startDailyDate" >Từ ngày</label>
            <input
              type="date" 
              id="startDailyDate" 
              v-model="startDailyDate" 
              :max="maxstartDailyDate"
              @change="updateendDailyDate"
              class="p-2 border bg-black-99 rounded"
            >
            
            <label class="mx-5 block text-sm font-medium " for="endDailyDate">Đến ngày</label>
            <input 
              type="date" 
              id="endDailyDate" 
              v-model="endDailyDate"
              disabled
              :min="startDailyDate"
              :max="currentDate"
              class="p-2 border bg-black-99 rounded"
            >
          </div>
          <div class="back h-full p-4 rounded-lg shadow">
            <canvas ref="profitChart"></canvas>
          </div>
          
        </div>
        
      </section>
      
      <!-- Quản trị người dùng -->
      <section v-if="currentSection === 'member-list'" class="mb-6">
        <h3 class="text-3xl py-10 text-center">Danh sách người dùng</h3>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Tìm kiếm người dùng</h2>
          <div class="ui-input-container mb-4">
            <input
              required
              placeholder="Tìm kiếm id, tên hoặc email.."
              class="ui-input w-full px-4 py-2 border rounded-lg"
              type="text"
              v-model="qMembers"
              @keyup="searchMembers"
            />
          </div>
          <!-- Cột 1: Trạng thái -->
            <div class="flex flex-col mb-5">
              <h3 class="font-semibold mb-2">Trạng thái</h3>
              <div class="flex flex-col gap-2">
                <label class="container flex items-center gap-2">
                  <input type="checkbox" :checked="selectedStatus === 'active'" @change="toggleStatus('active')" />
                  <svg viewBox="0 0 64 64" height="1em">
                    <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
                  </svg>
                  <span>Hoạt động</span>
                </label>
                <label class="container flex items-center gap-2">
                  <input type="checkbox" :checked="selectedStatus === 'banned'" @change="toggleStatus('banned')" />
                  <svg viewBox="0 0 64 64" height="1em">
                    <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
                  </svg>
                  <span>Bị cấm</span>
                </label>
              </div>
            </div>
          <!-- User -->
          <div class="overflow-x-auto back p-4 rounded-lg shadow">
            <table class="table w-full">
              <thead class="bg-gray-200">
                <tr class="text-left text-gray-700">
                  <th class="p-2">ID</th>
                  <th class="p-2">Hình Ảnh</th>
                  <th class="p-2">Tên</th>
                  <th class="p-2">Email</th>
                  <th class="p-2">Username</th>
                  <th class="p-2">Trạng Thái</th>
                  <th class="p-2">Cấm người dùng</th>
                  <th class="p-2">Thêm làm nhân viên</th>
                  <th class="p-2">Nhắn tin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredMembers" :key="member.member_id" class="border-t">
                  <td class="p-2">{{ member.member_id }}</td>
                  <td class="p-2">
                    <img
                      :src="member.member_image"
                      alt="Member Image"
                      class="w-12 h-12"
                    />
                  </td>
                  <td class="p-2">
                    {{ member?.first_name }} {{ member?.last_name }}
                  </td>
                  <td class="p-2">{{ member.email }}</td>
                  <td class="p-2">{{ member.user_log_info.username }}</td>
                  <td class="p-2 text-center">
                    {{ member.user_log_info.enabled === 1 ? "Hoạt động" : "Bị cấm" }}
                  </td>
                  <td class="p-2 text-center">
                    <div
                      v-if="member.user_log_info.enabled === 1"
                      class="hover-underline-animation-r cursor-pointer text-red-600"
                      @click="openBanModal(member)"
                    >
                      Cấm khỏi hệ thống
                    </div>
                    <div
                      v-else
                      class="hover-underline-animation-r cursor-pointer text-green-600"
                      @click="unbanUser(member)"
                    >
                      Bỏ cấm người dùng
                    </div>
                  </td>
                  <td class="p-2 text-center">
                  <span
                    v-if="member.user_log_info.enabled === 1"
                    @click="promoteToStaff(member.member_id)" 
                    class="hover-underline-animation cursor-pointer"
                  >
                    Thêm làm nhân viên
                  </span>
                  </td>
                  <td class="p-2 text-center">
                    <button class="hover-underline-animation" @click="mess(member.member_id)">Nhắn tin</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- DS Thành viên -->
        </div>
      </section>

      <!-- Danh sách seller -->
      <section v-if="currentSection === 'seller-list'" class="mb-6">
        <h3 class="text-3xl py-10 text-center">Danh sách người đăng bán</h3>

        <h2 class="text-xl font-semibold mb-4">Tìm kiếm người dùng</h2>
          <div class="ui-input-container mb-4">
            <input
              required
              placeholder="Tìm kiếm id, tên hoặc email.."
              class="ui-input w-full px-4 py-2 border rounded-lg"
              type="text"
              v-model="qMembers"
              @keyup="searchMembers"
            />
          </div>
          <!-- Cột 1: Trạng thái -->
        <div class="flex flex-col mb-6">
          <h3 class="font-semibold mb-2">Trạng thái</h3>
          <div class="flex flex-col gap-2">
            <label class="container flex items-center gap-2">
              <input type="checkbox" :checked="selectedStatus === 'active'" @change="toggleStatus('active')" />
              <svg viewBox="0 0 64 64" height="1em">
                <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
              </svg>
              <span>Hoạt động</span>
            </label>
            <label class="container flex items-center gap-2">
              <input type="checkbox" :checked="selectedStatus === 'banned'" @change="toggleStatus('banned')" />
              <svg viewBox="0 0 64 64" height="1em">
                <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
              </svg>
              <span>Bị cấm</span>
            </label>
          </div>
        </div>
          <div class="overflow-x-auto back p-4 rounded-lg shadow">
            <table class="table w-full">
              <thead class="bg-gray-200">
                <tr class="text-left text-gray-700">
                  <th class="p-2">ID</th>
                  <th class="p-2">Hình Ảnh</th>
                  <th class="p-2">Tên</th>
                  <th class="p-2">Email</th>
                  <th class="p-2">Username</th>
                  <th class="p-2">Trạng Thái</th>
                  <th class="p-2">Cấm người dùng</th>
                  <th class="p-2">Nhắn tin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredSeller" :key="member.member_id" class="border-t">
                  <td class="p-2">{{ member.member_id }}</td>
                  <td class="p-2">
                    <img
                      :src="member.member_image"
                      alt="Member Image"
                      class="w-12 h-12"
                    />
                  </td>
                  <td class="p-2">
                    <router-link class="hover-underline-animation" :to="`/retailer/${member.member_id}`">
                      {{ member?.first_name }} {{ member?.last_name }}
                    </router-link>
                  </td>
                  <td class="p-2">{{ member.email }}</td>
                  <td class="p-2">{{ member.user_log_info.username }}</td>
                  <td class="p-2 text-center">
                    {{ member.user_log_info.enabled === 1 ? "Hoạt động" : "Bị cấm" }}
                  </td>
                  <td class="p-2 text-center">
                    <div
                      v-if="member.user_log_info.enabled === 1"
                      class="hover-underline-animation-r cursor-pointer text-red-600"
                      @click="openBanModal(member)"
                    >
                      Cấm khỏi hệ thống
                    </div>
                    <div
                      v-else
                      class="hover-underline-animation-r cursor-pointer text-green-600"
                      @click="unbanUser(member)"
                    >
                      Bỏ cấm người dùng
                    </div>
                  </td>
                  <td class="p-2 text-center">
                    <button class="hover-underline-animation" @click="mess(member.member_id)">Nhắn tin</button>
                  </td>
                  
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        
        <!-- Danh sách staff -->
        <section v-if="currentSection === 'staff-list'" class="mb-6">
        <h3 class="text-3xl text-center py-10">Danh sách nhân viên</h3>
        <h2 class="text-xl font-semibold mb-4">Tìm kiếm người dùng</h2>
          <div class="ui-input-container mb-4">
            <input
            required
            placeholder="Tìm kiếm id, tên hoặc email.."
            class="ui-input w-full px-4 py-2 border rounded-lg"
              type="text"
              v-model="qStaff"
              @keyup="searchMembers"
            />
          </div>
          <div class="flex flex-row gap-8">
  <!-- Cột 1: Trạng thái -->
  <div class="flex flex-col">
    <h3 class="font-semibold mb-2">Trạng thái</h3>
    <div class="flex flex-col gap-2">
      <label class="container flex items-center gap-2">
        <input type="checkbox" :checked="selectedStatus === 'active'" @change="toggleStatus('active')" />
        <svg viewBox="0 0 64 64" height="1em">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
        </svg>
        <span>Hoạt động</span>
      </label>
      <label class="container flex items-center gap-2">
        <input type="checkbox" :checked="selectedStatus === 'banned'" @change="toggleStatus('banned')" />
        <svg viewBox="0 0 64 64" height="1em">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
        </svg>
        <span>Bị cấm</span>
      </label>
    </div>
  </div>

  <!-- Cột 2: Vai trò -->
  <div class="flex flex-col mb-5">
    <h3 class="font-semibold mb-2">Vai trò</h3>
    <div class="flex flex-col gap-2">
      <label class="container flex items-center gap-2">
        <input type="checkbox" :checked="selectedRole === 'staff'" @change="toggleRole('staff')" />
        <svg viewBox="0 0 64 64" height="1em">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
        </svg>
        <span>Nhân viên</span>
      </label>
      <label class="container flex items-center gap-2">
        <input type="checkbox" :checked="selectedRole === 'appraiser'" @change="toggleRole('appraiser')" />
        <svg viewBox="0 0 64 64" height="1em">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
        </svg>
        <span>Chuyên viên kiểm định</span>
      </label>
      <label class="container flex items-center gap-2">
        <input type="checkbox" :checked="selectedRole === 'shipper'" @change="toggleRole('shipper')" />
        <svg viewBox="0 0 64 64" height="1em">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
        </svg>
        <span>Nhân viên vận chuyển</span>
      </label>
    </div>
  </div>
</div>
          <div class="overflow-x-auto back p-4 rounded-lg shadow">
            <table class="table w-full">
              <thead class="bg-gray-200">
                <tr class="text-left text-gray-700">
                  <th class="p-2">ID</th>
                  <th class="p-2">Hình Ảnh</th>
                  <th class="p-2">Tên</th>
                  <th class="p-2">Email</th>
                  <th class="p-2">Username</th>
                  <th class="p-2">Vai trò</th>
                  <th class="p-2">Trạng Thái</th>
                  <th class="p-2">Cấm người dùng</th>
                  <th class="p-2">Nhắn tin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredStaff" :key="member.member_id" class="border-t">
                  <td class="p-2">{{ member.member_id }}</td>
                  <td class="p-2">
                    <img
                      :src="member.member_image"
                      alt="Member Image"
                      class="w-12 h-12"
                    />
                  </td>
                  <td class="p-2">
                    {{ member?.first_name }} {{ member?.last_name }}
                  </td>
                  <td class="p-2">{{ member.email }}</td>
                  <td class="p-2">{{ member.user_log_info.username }}</td>
                  <td class="p-2 text-center">
                    <div v-if="member.user_log_info.authorities.authority == 'ROLE_STAFF' && member.staff_role == null" class="cursor-pointer hover-underline-animation"
                      @click="openPromoteModal(member)"
                    >
                      {{ member.staff_role ? roleLabels[member.staff_role] : roleLabels[member.user_log_info.authorities.authority] }}
                    </div>
                    <div v-else 
                    class="cursor-pointer hover-underline-animation"
                    @click="openPromoteModal(member)">
                      {{ member.staff_role ? roleLabels[member.staff_role] : roleLabels[member.user_log_info.authorities.authority] }}
                    </div>
                  </td>
                  <td class="p-2 text-center">
                    {{ member.user_log_info.enabled === 1 ? "Hoạt động" : "Bị cấm" }}
                  </td>
                  <td class="p-2 text-center">
                    <div
                      v-if="member.user_log_info.enabled === 1"
                      class="hover-underline-animation-r cursor-pointer text-red-600"
                      @click="openBanModal(member)"
                    >
                      Cấm khỏi hệ thống
                    </div>
                    <div
                      v-else
                      class="hover-underline-animation-r cursor-pointer text-green-600"
                      @click="unbanUser(member)"
                    >
                      Bỏ cấm người dùng
                    </div>
                  </td>
                  <td class="p-2 text-center">
                    <button class="hover-underline-animation" @click="mess(member.member_id)">Nhắn tin</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </section>

      <!-- Quản trị Danh Sách sản phẩm -->
      <section v-if="currentSection === 'products'" class="mb-6">
        <h2 class="text-2xl font-semibold mb-4">Danh Sách Đồng Hồ</h2>
        <div class="ui-input-container mb-4">
          <input
            required
            placeholder="Tìm kiếm id, tên Danh Sách sản phẩm hoặc người bán.."
            class="ui-input w-full px-4 py-2 border rounded-lg"
            type="text"
            v-model="qWatches"
            @keyup.enter="searchWatches"
          />
        </div>
        <div class="flex flex-col mb-4">
  <h3 class="font-semibold mb-2">Trạng thái</h3>
  <div class="flex w-full justify-between p-1">
    <label v-for="(label, state) in stateLabels" :key="state" class="container flex  items-center gap-1">
      <input type="checkbox" v-model="selectedStates" :value="Number(state)" />
      <svg viewBox="0 0 64 64" height="1em">
        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" class="path"></path>
      </svg>
      <span>{{ label }}</span>
    </label>
  </div>
</div>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
          <table class="table w-full">
            <thead class="bg-gray-200">
              <tr class="text-left text-gray-700">
                <th class="p-2">ID</th>
                <th class="p-2">Tên</th>
                <th class="p-2">Người bán</th>
                <th class="p-2">Giá</th>
                <th class="p-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredWatches" :key="product.watch_id">
              <td class="p-2 border-b">
              <router-link class="hover-underline-animation " :to="`/detail/${product.watch_id}`">{{ product.watch_id }}</router-link>
              </td>
              <td class="p-2 border-b">{{ product.watch_name }}</td>
              <td class="p-2 border-b">
                <div class="flex items-center">
                  <img
                    :src="product.seller.member_image"
                    alt="Seller Image"
                    class="w-8 h-8 mr-2"
                  />
                  <span>{{ product.seller.user_log_info.username }}</span>
                </div>
              </td>
              <td class="p-2 border-b">{{ currency(product.price) }}</td>
              <td class="p-2 border-b">
                {{ stateLabels[product.state] }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <!-- Danh sách chờ duyệt -->
      <section v-if="currentSection === 'pending-products'" class="mb-6">
        <h2 class="text-2xl font-semibold mb-4">Danh Sách Đồng Hồ Chờ Duyệt</h2>
        <div class="ui-input-container mb-4">
          <input
            required
            placeholder="Tìm kiếm id, tên Danh Sách sản phẩm hoặc người bán.."
            class="ui-input w-full px-4 py-2 border rounded-lg"
            type="text"
            v-model="qPendingWatches"
            @keyup.enter="searchPendingWatches"
          />
        </div>
         <div class="overflow-x-auto back  p-4 rounded-lg shadow">
          <table class="table w-full">
            <thead class="bg-gray-200">
              <tr class="text-left text-gray-700">
                <th class="p-2">ID</th>
                <th class="p-2">Tên</th>
                <th class="p-2">Mã Duyệt</th>
                <th class="p-2">Người bán</th>
                <th class="p-2">Được kiểm định bởi</th>
                <th class="p-2">Thời gian được kiểm định</th>
                <th class="p-2">Trạng thái</th>
                <th class="p-2">Hành động</th>
                <th class="p-2">Xoá</th>
                
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredPendingWatches" :key="product.watch_id">
              <td class="p-2 border-b">
              <router-link class="hover-underline-animation " :to="`/detail/${product.watch_id}`">{{ product.watch_id }}</router-link>
              </td>
              <td class="p-2 border-b">{{ product.watch_name }}</td>
              <td class="p-2 border-b">
                {{ req[product.watch_id]?.request_id ?? null }}
              </td>
              <td class="p-2 border-b">
                <div class="flex items-center">
                  <img
                    :src="product.seller.member_image"
                    alt="Seller Image"
                    class="w-8 h-8 mr-2"
                  />
                  <span>{{ product.seller.user_log_info.username }}</span>
                </div>
              </td>
              <td class="p-2 border-b">{{ req[product.watch_id]?.appraiser_assigned ?? null }}</td>
              <td v-if="req[product.watch_id]?.appraiser_assigned" class="p-2 border-b">{{ req[product.watch_id]?.appointment_date ? formatDate(req[product.watch_id]?.appointment_date) : 'Chưa có ngày' }}</td>
              <td v-else class="p-2 border-b">{{ req[product.watch_id]?.appointment_date  ? formatDateWithoutTime(req[product.watch_id]?.appointment_date) : 'Chưa có ngày' }}</td>
              <td class="p-2 border-b">{{ req[product.watch_id]?.status ?? null  }}</td>
              <td class="p-2 border-b">
                <button @click="openAssignModal(product)" class="hover-underline-animation">
                  Giao cho Kiểm định viên
                </button>
              </td>
              <td>
                <button class="hover-underline-animation-r" @click="deleteWatch(product.seller.member_id,product.watch_id)">Xoá</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Quản trị đơn hàng -->
      <section v-if="currentSection === 'orders'" class="mb-6">
        <h2 class="text-2xl font-semibold mb-4">Đơn Hàng</h2>
        <div class="ui-input-container mb-4">
          <input
            required
            placeholder="Tìm kiếm đơn hàng id, trạng thái, Danh Sách sản phẩm hoặc tên khách hàng.."
            class="ui-input w-full px-4 py-2 border rounded-lg"
            type="text"
            v-model="qOrders"
            @keyup.enter="searchOrders"
          />
        </div>
        <!-- Các đơn bình thường -->
        <h1 class="text-center text-2xl py-5">Danh sách các đơn hàng</h1>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
          <table class="table">
          <thead class="table-header">
            <tr class="text-primary">
              <th class="p-2 border-b">ID Đơn Hàng</th>
              <th class="p-2 border-b">Ngày Tạo</th>
              <th class="p-2 border-b">Địa Chỉ</th>
              <th class="p-2 border-b">Tên Nhận Hàng</th>
              <th class="p-2 border-b">Số Điện Thoại</th>
              <th class="p-2 border-b">Ngày giao hàng</th>
              <th class="p-2 border-b">Trạng thái</th>
              <th class="p-2 border-b">Ghi Chú</th>
              <th class="p-2 border-b">Tổng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.order_id">
              <td class="p-2 border-b">{{ order.order_id }}</td>
              <td class="p-2 border-b">
                {{ formatDate(order.create_time) }}
              </td>
              <td class="p-2 border-b">{{ order.address }}</td>
              <td class="p-2 border-b">{{ order.receive_name }}</td>
              <td class="p-2 border-b">{{ order.phone }}</td>
              <td class="p-2 border-b">{{ formatDate(order.shipping_date) ?? "Không có thông tin"}}</td>
              <td class="p-2 border-b">{{ stateOrders[order.state] }}</td>
              <td class="p-2 border-b">{{ order.notice || "Không có thông tin" }}</td>
              <td class="p-2 border-b">{{ currency(order.total_price) }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <!-- Đơn thành công -->
        <h1 class="text-center text-2xl py-5">Danh sách các đơn hàng giao thành công</h1>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
          <table class="table">
          <thead class="table-header">
            <tr class="text-primary">
              <th class="p-2 border-b">ID Đơn Hàng</th>
              <th class="p-2 border-b">Ngày Tạo</th>
              <th class="p-2 border-b">Địa Chỉ</th>
              <th class="p-2 border-b">Tên Nhận Hàng</th>
              <th class="p-2 border-b">Số Điện Thoại</th>
              <th class="p-2 border-b">Ngày giao hàng</th>
              <th class="p-2 border-b">Trạng thái</th>
              <th class="p-2 border-b">Ghi Chú</th>
              <th class="p-2 border-b">Tổng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredSuccessOrders" :key="order.order_id">
              <td class="p-2 border-b">{{ order.order_id }}</td>
              <td class="p-2 border-b">
                {{ formatDate(order.create_time) }}
              </td>
              <td class="p-2 border-b">{{ order.address }}</td>
              <td class="p-2 border-b">{{ order.receive_name }}</td>
              <td class="p-2 border-b">{{ order.phone }}</td>
              <td class="p-2 border-b">{{ formatDate(order.shipping_date) ?? "Không có thông tin"}}</td>
              <td class="p-2 border-b">{{ stateOrders[order.state] }}</td>
              <td class="p-2 border-b">{{ order.notice || "Không có thông tin" }}</td>
              <td class="p-2 border-b">{{ currency(order.total_price) }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <!-- Các đơn hàng bị huỷ -->
        <h1 class="text-center text-2xl py-5">Danh sách các đơn hàng bị huỷ</h1>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
          <table class="table">
          <thead class="table-header">
            <tr class="text-primary">
              <th class="p-2 border-b">ID Đơn Hàng</th>
              <th class="p-2 border-b">Ngày Tạo</th>
              <th class="p-2 border-b">Địa Chỉ</th>
              <th class="p-2 border-b">Tên Nhận Hàng</th>
              <th class="p-2 border-b">Số Điện Thoại</th>
              <th class="p-2 border-b">Ngày giao hàng</th>
              <th class="p-2 border-b">Trạng thái</th>
              <th class="p-2 border-b">Ghi Chú</th>
              <th class="p-2 border-b">Tổng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredFailOrders" :key="order.order_id">
              <td class="p-2 border-b">{{ order.order_id }}</td>
              <td class="p-2 border-b">
                {{ formatDate(order.create_time) }}
              </td>
              <td class="p-2 border-b">{{ order.address }}</td>
              <td class="p-2 border-b">{{ order.receive_name }}</td>
              <td class="p-2 border-b">{{ order.phone }}</td>
              <td class="p-2 border-b">{{ formatDate(order.shipping_date) ?? "Không có thông tin"}}</td>
              <td class="p-2 border-b">{{ stateOrders[order.state] }}</td>
              <td class="p-2 border-b">{{ order.notice || "Không có thông tin" }}</td>
              <td class="p-2 border-b">{{ currency(order.total_price) }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>

      <!-- Quản trị shipping -->
      <section v-if="currentSection === 'shipping'" class="mb-6">
        <h2 class="text-2xl font-semibold mb-4">Phân đơn cho shipper</h2>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
            <table class="table w-full">
              <thead class="bg-gray-200">
                <tr class="text-left text-gray-700">
                  <th class="p-2">ID</th>
                  <th class="p-2">Hình Ảnh</th>
                  <th class="p-2">Tên</th>
                  <th class="p-2">Email</th>
                  <th class="p-2">Username</th>
                  <th class="p-2">Trạng Thái</th>
                  <th class="p-2">Hoạt động</th>
                  <th class="p-2">Nhắn tin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredShipper" :key="member.member_id" class="border-t">
                  <td class="p-2">{{ member.member_id }}</td>
                  <td class="p-2">
                    <img
                      :src="member.member_image"
                      alt="Member Image"
                      class="w-12 h-12"
                    />
                  </td>
                  <td class="p-2">
                    {{ member?.first_name }} {{ member?.last_name }}
                  </td>
                  <td class="p-2">{{ member.email }}</td>
                  <td class="p-2">{{ member.user_log_info.username }}</td>
                  <td class="p-2 text-center">
                    {{ member.user_log_info.enabled === 1 ? "Hoạt động" : "Bị cấm" }}
                  </td>
                  <td class="p-2 text-center justify-between">
                    <button @click="openAssign(member)" class="hover-underline-animation">Giao đơn</button>
                    <!-- <button @click="openDetail(member)" class="hover-underline-animation">Xem chi tiết</button> -->
                  </td>
                  <td class="p-2 text-center">
                    <button class="hover-underline-animation" @click="mess(member.member_id)">Nhắn tin</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </section>
      <!--  -->
      <!-- Quản trị giao dịch cần hoàn tiền -->
      <section v-if="currentSection === 'refund-transactions'" class="mb-6">
        <h2 class="text-2xl font-semibold mb-4">Giao Dịch Cần Hoàn Tiền</h2>
        <div class="ui-input-container mb-4">
          <input
            required
            placeholder="Tìm kiếm mã giao dịch, Danh Sách sản phẩm, hoặc tên khách hàng.."
            class="ui-input w-full px-4 py-2 border rounded-lg"
            type="text"
            v-model="qRefunds"
            @keyup.enter="searchRefunds"
          />
        </div>
        <div class="overflow-x-auto back p-4 rounded-lg shadow">
          <table class="table">
        <thead class="table-header">
            <tr class="text-primary">
              <th class="p-2 border-b">Mã giao dịch</th>
              <th class="p-2 border-b">Số tiền</th>
              <th class="p-2 border-b">ID Người Dùng</th>
              <th class="p-2 border-b">Tên Người Dùng</th>
              <th class="p-2 border-b">Phương thức thanh toán</th>
              <th class="p-2 border-b">Ngân hàng</th>
              <th class="p-2 border-b">Thời gian tạo</th>
              <th class="p-2 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredNullOrders" :key="transaction.transaction_no">
              <td class="p-2 border-b">{{ transaction.transaction_no }}</td>
              <td class="p-2 border-b">{{ currency(transaction.payment_amount) }}</td>
              <td class="p-2 border-b">{{ transaction.member_id }}</td>
              <td class="p-2 border-b">{{ getMemberName(transaction.member_id) }}</td>
              <td class="p-2 border-b">{{ transaction.payment_method }}</td>
              <td class="p-2 border-b">{{ transaction.bank_code }}</td>
              <td class="p-2 border-b">{{ formatDate(transaction.create_at) }}</td>
              <td>
                <button class="hover-underline-animation" @click="sendEmail(transaction.transaction_no, transaction.member_id)">
                  Phản hồi
                </button>
              </td>
            </tr>
        </tbody>
      </table>
        </div>
      </section>
    </main>



    <!-- Ban User Modal -->
    <div v-if="isBanModalOpen" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeBanModal">&times;</span>
        <h2>Xác nhận Cấm người dùng</h2>
        <textarea
          v-model="banMessage"
          placeholder="Lý do cấm người dùng"
          rows="4"
          class="textarea"
        ></textarea>
        <button @click="confirmBanUser" class="confirm-btn">Xác nhận</button>
      </div>
    </div>

    <!-- Promote Modal -->
    <div class="promoteBox" v-if="openPromote">
      <div class="promote">
        <h2 class="mb-5">Chọn vị trí bổ nhiệm</h2>
        <select class="py-3" name="promote" id="promote">
          <option value="0">Trở thành chuyên viên kiểm định</option>
          <option value="1">Trở thành nhân viên vận chuyển</option>
        </select>
        <div class="gap-1 flex justify-end mt-5">
          <button class="th-s-btn" @click="closePromoteModal">Hủy</button>
          <button class="th-p-btn" @click="promote">Xác nhận</button>
        </div>
      </div>
    </div>

    <!-- Modal để giao việc -->
    <div v-if="showAssignModal" class="modal">
      <div class="modal-content">
        <h2 class="text-2xl font-semibold mb-4">Giao đồng hồ cho kiểm định viên</h2>
    
          <!-- Thông tin đồng hồ -->
          <div class="watch-info mb-4">
            <h3 class="text-xl font-medium mb-2">Đồng hồ được chọn:</h3>
            <p><strong>ID:</strong> {{ selectedWatch.watch_id }}</p>
            <p><strong>Tên:</strong> {{ selectedWatch.watch_name }}</p>
          </div>

          <!-- Dropdown để chọn Appraiser -->
          <div class="appraiser-select mb-4">
            <h3 class="text-xl font-medium mb-2">Chọn kiểm định viên:</h3>
            <select v-model="selectedAppraiser" class="w-full p-2 border rounded bg-black-99">
              <option value="" disabled>Chọn một kiểm định viên</option>
              <option v-for="appraiser in getAppraisers" :key="appraiser.member_id" :value="appraiser">
                {{ appraiser.first_name }} {{ appraiser.last_name }}
              </option>
            </select>
          </div>
        <div class="flex w-full justify-start ">
          <VueDatePicker v-model="date" placeholder="Chọn ngày giao kiểm định" :format="formatDate"></VueDatePicker>
        </div>
        <span v-if="!req[selectedWatch.watch_id].appraiser_assigned" >Khách chọn ngày kiểm định: {{ formatDateWithoutTime(req[selectedWatch.watch_id]?.appointment_date) }}</span>
          <p v-if="dateWarning" class="text-red-500 pt-2">{{ dateWarning }}</p>
        <br />
        <div class="modal-actions">
          <button @click="showAssignModal = false" class="border-2 border-secondary p-2">
            Hủy
          </button>
          <button @click="assignWatch" :disabled="!selectedAppraiser || !date" class="th-p-btn">
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- Modal để giao đơn -->
    <div v-if="assignShipModal" class="modal">
      <div class="modal-content">
        <h2 class="text-2xl font-semibold mb-4">Giao đơn cho Shipper</h2>
        
        <!-- Shipper Information -->
        <div class="shipper-info mb-4">
          <h3 class="text-xl font-medium mb-2">Thông tin Shipper:</h3>
          <p><strong>ID:</strong> {{ selectedShipper.member_id }}</p>
          <p><strong>Tên:</strong> {{ selectedShipper.first_name }} {{ selectedShipper.last_name }}</p>
        </div>

        <!-- Pending Orders Dropdown -->
        <div class="order-select mb-4">
          <h3 class="text-xl font-medium mb-2">Chọn đơn hàng cần giao:</h3>
          <select 
            v-model="selectedOrderId" 
            @change="logSelection" 
            class="w-full p-2 border rounded bg-black-99"
          >
            <option value="" disabled>Chọn một đơn hàng</option>
            <option v-for="order in getShipOrder" :key="order.order_id" :value="order.order_id">
              Đơn hàng #{{ order.order_id }} - {{ order.receive_name }}
            </option>
          </select>
        </div>
        <p v-if="assignmentMessage" :class="{'text-green-500': assignmentMessage.includes('thành công'), 'text-red-500': assignmentMessage.includes('thất bại')}" class="mb-4">
        {{ assignmentMessage }}
      </p>
        <div class="modal-actions">
          <button @click="closeModal" class="border-2 border-secondary p-2">
            Hủy
          </button>
          <button @click="assignOrderToShipper" :disabled="!selectedOrderId" class="th-p-btn">
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    

  </div>

</div>
</div>

<div v-else>
  <div class="flex justify-center items-center gap-6 text-center title">
      <span class="text-border">4</span>
      <clock/>
      <span class="text-border">4</span>
  </div>
  <div class="flex flex-col justify-center items-center gap-5">
      <span>Oops, không có gì ở đây hết quay về <router-link to="/" class="hover-underline-animation">Trang chủ</router-link> đi !</span>
  </div>

</div>

</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from "vue";
import { useAdminStore } from "../stores/admin";
import Chart from 'chart.js/auto';
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";
import { useUserStore } from "../stores/user";
import router from "../router";
import { useMailStore } from "../stores/mail";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import Clock from '../components/Clock.vue'
import { useWatchStore } from "../stores/watch";


const req = ref({});

onMounted(() => {
  updateOrderStats() 
  useAdminStore().getRequestWatches()
    .then(response => {
      req.value = response.reduce((map, watch) => {
        map[watch.appraise_watch] = watch;
        return map;
      }, {});
      console.log("BBB", req.value);
    })
    .catch(error => {
      console.error("Error fetching request watches:", error);
    });
});

const deleteWatch = (sid, wid) => {
  useWatchStore().deleteWatch(sid, wid)
}

const date = ref(new Date());
const dateWarning = ref('');

const validateDate = (selectedDate) => {
  const today = new Date();
  // Set time to midnight to avoid issues with time comparison
  today.setHours(0, 0, 0, 0);

  // Add one day to today's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (!selectedDate) return null;

  // Compare selectedDate with tomorrow
  if (selectedDate < tomorrow) {
    dateWarning.value = "Bạn phải chọn ngày sau hôm nay ít nhất 1 ngày.";
    date.value = null;
  } else {
    dateWarning.value = "";
  }
};

const selectedRole = ref(null);
const selectedStatus = ref(null);

const toggleStatus = (status) => {
  if (selectedStatus.value === status) {
    selectedStatus.value = null;
  } else {
    selectedStatus.value = status;
  }
};

const toggleRole = (role) => {
  if (selectedRole.value === role) {
    selectedRole.value = null;
  } else {
    selectedRole.value = role;
  }
};


watch(date, (newDate) => {
  validateDate(newDate);
});


const logout = () => {
  console.log(1);
  
   useAuthStore().logout().then(
    window.location.replace('/')
  )
};

const stateLabels = {
  0: "Vừa đăng",
  1: "Được duyệt",
  2: "Bị xóa",
  3: "Chờ giao",
  4: "Đang giao",
  5: "Đang thanh toán",
  6: "Hoàn tất",
  7: "Đã giao",
};

const stateOrders = {
  NEW: "Vừa tạo",
  PENDING: "Đang chờ",
  SHIPPING: "Đang giao",
  SUCCESS: "Giao thành công",
  FAILED: "Hủy",
  DELETED: "Xóa",
  SHIPPED: "Đã giao",
};

const roleLabels = {
  ROLE_USER: "Người dùng",
  ROLE_SELLER: "Người bán",
  ROLE_STAFF: "Nhân viên",
  SHIPPER: "Nhân viên vận chuyển",
  APPRAISER: "Chuyên viên kiểm định",
  ROLE_ADMIN: "Quản trị viên",
};

const isAdmin = ref(false)

// Check user role
const userStore = useUserStore();
const authStore = useAuthStore();
if (
  userStore.role !== "ROLE_ADMIN" &&
  authStore.user_id !== import.meta.env.VITE_ADMIN_USERID
) {
  console.log("Not ADMIN");
  router.push("/");
}

const checkAdmin = (userId) => {
  if(useUserStore().loadUser(userId).then(userStore.role==='ROLE_ADMIN')){
    isAdmin.value = true;
    console.log(isAdmin.value);
    return router.push('/admin')
  }
  else{
    isAdmin.value = false
    router.push('/')
  }

}

console.log(checkAdmin(authStore.user_id));


// Initialize the store
const adminStore = useAdminStore();



// State variables
const isBanModalOpen = ref(false);
const banMessage = ref("");
const selectedMember = ref(null);

const qMembers = ref('');
const qStaff = ref('');
const qWatches = ref('');
const qPendingWatches = ref('')
const qOrders = ref('');
const nOrders = ref('');

// Chart

// Chart variable

//Chart filter
const showFilter = ref(false);
const selectedFilter = ref([]);
const filters = reactive({
  yearMonthDay: {
    from: null,
    to: null
  },
  yearMonth: {
    from: null,
    to: null
  }
});

const selectedAppraiser = ref(null)

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    const pad = (num, size = 2) => String(num).padStart(size, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = pad(date.getMilliseconds(), 6); // Adjust for microseconds

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}
const assignWatch = () => {
  let seller;
  
  // Check the selected watch's data
  console.log(req.value[selectedWatch.value.watch_id]);
  console.log("VVVV", selectedWatch.value.seller.member_id);
  
  // Fetch seller information as a promise
  useUserStore()?.getUserInfo(selectedWatch.value.seller.member_id)
    .then(result => {
      seller = result;
      console.log("GG",seller);

      const timestamp = date.value.getTime() - 7 * 60 * 60 * 1000;
      console.log(formatTimestamp(timestamp));
      
      // Check if the appraiser has already been assigned
      if (req.value[selectedWatch.value.watch_id].appraiser_assigned) {
        adminStore.updateRequest(
          selectedAppraiser.value.member_id, 
          req.value[selectedWatch.value.watch_id].request_id, 
          formatTimestamp(timestamp)
        );
        
        showAssignModal.value = !showAssignModal.value;
        useMailStore().send(
  selectedAppraiser.value.email,
  'Thông báo kiểm định',
  `Bạn vui lòng có mặt lúc ${date.value.getHours()}:${date.value.getMinutes()} ngày ${date.value.getDate()}/${date.value.getMonth() + 1}/${date.value.getFullYear()}.`
);
useMailStore().send(
  seller.email,
  'Thông báo kiểm định',
  `Bạn vui lòng có mặt lúc ${date.value.getHours()}:${date.value.getMinutes()} ngày ${date.value.getDate()}/${date.value.getMonth() + 1}/${date.value.getFullYear()}.`
);

        return;
      }
      
      // Assign the appraiser and send the email notification
      adminStore.assignWatchRequest(
        req.value[selectedWatch.value.watch_id].request_id, 
        selectedAppraiser.value.member_id,
        formatTimestamp(timestamp)
      );
      
      showAssignModal.value = !showAssignModal.value;
      useMailStore().send(
  selectedAppraiser.value.email,
  'Thông báo kiểm định',
  `Bạn vui lòng có mặt lúc ${date.value.getHours()}:${date.value.getMinutes()} ngày ${date.value.getDate()}/${date.value.getMonth() + 1}/${date.value.getFullYear()}.`
);
useMailStore().send(
  seller.email,
  'Thông báo kiểm định',
  `Bạn vui lòng có mặt lúc ${date.value.getHours()}:${date.value.getMinutes()} ngày ${date.value.getDate()}/${date.value.getMonth() + 1}/${date.value.getFullYear()}.`
);

    })
    .catch(error => {
      console.error("Error fetching user info:", error);
    });
};

const greeting = ref("");
const openPromote = ref(false)

// Error state
const error = ref(null);

const openPromoteModal = (member) => {
  selectedMember.value = member;
  openPromote.value = true
};

const closePromoteModal = () => {
  openPromote.value = false
};

const showAssignModal = ref('')
const selectedWatch = ref(null);
const assignShipModal = ref(false);
const showShipperOrdersModal = ref(false);
const selectedShipper = ref(null);
const selectedOrderId = ref(null);
const selectedOrder = computed(() => {
  return getShipOrder.value.find(order => order.order_id === selectedOrderId.value) || null;
});

const logSelection = () => {
  console.log('Selected Order ID:', selectedOrderId.value);
  console.log('Selected Order:', selectedOrder.value);
};


const assignedOrders = ref([]);

const resetModalState = () => {
  assignmentMessage.value = '';
  selectedOrderId.value = '';
};

const openAssign = async (shipper, order) => {
  assignShipModal.value = true;
  selectedShipper.value = shipper;
  selectedOrderId.value = order;
  resetModalState();
};

const closeModal = () => {
  assignShipModal.value = false;
  resetModalState();
};

const openModal = () => {
  assignShipModal.value = true;
  resetModalState();
};


const openAssignModal = async (watch) => {
  selectedWatch.value = watch;
  showAssignModal.value = true;
  console.log("RRRR",watch);
};

const assignmentMessage = ref('');

const assignOrderToShipper = async () => {
  console.log('assignOrderToShipper called');
  console.log('Selected Order ID:', selectedOrderId.value);
  console.log('Selected Shipper:', selectedShipper.value.member_id);
  
  if (selectedOrderId.value) {
    try {
      const result = await useAdminStore().assignOrderToShipper(selectedShipper.value.member_id, selectedOrderId.value);
      if (result === 'Shipper Assigned') {
        assignmentMessage.value = "Phân đơn thành công";
      } else {
        assignmentMessage.value = "Phân đơn thất bại do người bán chưa đóng gói kiện hàng";
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      assignmentMessage.value = "Phân đơn thất bại do người bán chưa đóng gói kiện hàng";
    }
  } else {
    console.log('No order selected');
    assignmentMessage.value = "Vui lòng chọn một đơn hàng";
  }
};

watch(selectedOrderId, () => {
  assignmentMessage.value = '';
});

function setGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 5) {
    greeting.value = "Chào buổi tối";
  } else if (hour >= 5 && hour < 12) {
    greeting.value = "Chào buổi sáng";
  } else if (hour >= 12 && hour < 18) {
    greeting.value = "Chào buổi chiều";
  } else{
    greeting.value = "Chào buổi tối";
  }
}


const promote = () => {
  const promoteSelect = document.getElementById('promote');
  const selectedValue = promoteSelect.options[promoteSelect.selectedIndex].value;
  
  console.log('Member ID:', selectedMember.value.member_id);
  console.log('Selected Promotion Value:', selectedValue);

  adminStore.updateStaffRole(selectedMember.value.member_id, selectedValue==0?'APPRAISER':'SHIPPER')
  closePromoteModal()
};



// Fetch data from the store on component mount
onMounted(async () => {
  try {
    date.value = null
    await adminStore.getTopThreeWatch();
    await adminStore.getMembers();
    await adminStore.getWatches();
    await adminStore.getOrders();
    await adminStore.getOrdersNull();
    setGreeting();
    if (currentSection.value === 'profit-overview') {
      await createCharts();
      const today = new Date()
      endDailyDate.value = today.toISOString().split('T')[0]
      const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))
      startDailyDate.value = sevenDaysAgo.toISOString().split('T')[0]

      // Set apiendDailyDate to one day after endDailyDate
      const apiEnd = new Date(endDailyDate.value)
      apiEnd.setDate(apiEnd.getDate() + 1)
      apiendDailyDate.value = apiEnd.toISOString().split('T')[0]

      try {
        if (profitChart.value) {
          await nextTick()
          await fetchAndProcessProfitData(startDailyDate.value, endDailyDate.value, apiendDailyDate.value)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } 
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "Failed to fetch initial data. Please try refreshing the page.";
  }
});


const getMemberName = (memberId) => {
  const member = adminStore.members.find(m => m.member_id === memberId);
  return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
};

const getMember = (memberId) => {
  return adminStore.members.find(m => m.member_id === memberId);
};

const getAppraisers = computed(() => {
  return adminStore.members.filter(member => 
    member.staff_role === 'APPRAISER'
  );
});

const getShipOrder = computed(() => {
  console.log(adminStore.orders.filter(order => 
    order.state === 'PENDING'
  ));
  
  return adminStore.orders.filter(order => 
    order.state === 'PENDING'
  );
});
//Get top three watch API
const topThreeWatch = ref([]);

watch(
  () => adminStore.topThreeWatch,
  (newValue) => {
    topThreeWatch.value = newValue;
  }
);


// Define computed properties with error handling
const filteredMembers = computed(() => {
  return adminStore.filteredMembers(qMembers.value, 'ROLE_USER', selectedStatus.value);
});

const filteredSeller = computed(() => {
  return adminStore.filteredMembers(qMembers.value, 'ROLE_SELLER', selectedStatus.value);
});

const filteredStaff = computed(() => {
  return adminStore.filteredMembers(qStaff.value, 'ROLE_STAFF', selectedStatus.value);
});

const filteredShipper = computed(() => {
  try {
    return adminStore.filteredMembers(qMembers.value).filter(member => member.staff_role === 'SHIPPER');
  } catch (err) {
    console.error("Error in filteredMembers:", err);
    error.value = "Error filtering members. Please try again.";
    return [];
  }
});

const selectedStates = ref([]);

const filteredWatches = computed(() => {
  let filtered = adminStore.filteredWatches(qWatches.value);
  
  if (selectedStates.value.length > 0) {
    filtered = filtered.filter(product => selectedStates.value.includes(product.state));
  }
  
  return filtered;
});


const filteredPendingWatches = computed(() => {
  try {
    return adminStore.filteredWatches(qPendingWatches.value).filter(product => product.state === 0);
  } catch (err) {
    console.error("Error in filteredPendingWatches:", err);
    error.value = "Error filtering newly posted watches. Please try again.";
    return [];
  }
});

const filteredSuccessOrders = computed(() => {
  try {
    return adminStore.filteredOrders(qOrders.value).filter(order => order.state === 'SUCCESS');
  } catch (err) {
    console.error("Error in filteredOrders:", err);
    error.value = "Error filtering orders. Please try again.";
    return [];
  }
});

const filteredFailOrders = computed(() => {
  try {
    return adminStore.filteredOrders(qOrders.value).filter(order => order.state === 'FAIL');
  } catch (err) {
    console.error("Error in filteredOrders:", err);
    error.value = "Error filtering orders. Please try again.";
    return [];
  }
});

const filteredOrders = computed(() => {
  try {
    return adminStore.filteredOrders(qOrders.value).filter(order => order.state !== 'FAIL' && order.state !== 'SUCCESS');
  } catch (err) {
    console.error("Error in filteredOrders:", err);
    error.value = "Error filtering orders. Please try again.";
    return [];
  }
});


const filteredNullOrders = computed(() => {
  try {
    return adminStore.filteredNullOrders(nOrders.value);
  } catch (err) {
    console.error("Error in filteredOrders:", err);
    error.value = "Error filtering orders. Please try again.";
    return [];
  }
});



// Updated searchMembers function with more robust error handling
const searchMembers = () => {
  adminStore.getMembers()
    .then(() => {
      adminStore.members = adminStore.members.filter(member => {
        if (!member) return false;

        // Ensure member properties are defined
        const id = member.member_id ? member.member_id.toString() : ''; // Convert ID to string
        const firstName = member.first_name ? member.first_name.toLowerCase() : '';
        const lastName = member.last_name ? member.last_name.toLowerCase() : '';
        const email = member.email ? member.email.toLowerCase() : '';
        const username = member.user_log_info.username ? member.user_log_info.username.toLowerCase() : '';

        // Convert query to lower case
        const query = qMembers.value.toLowerCase();

        // Check if any field includes the search query
        return (
          id.includes(query) || 
          firstName.includes(query) || 
          lastName.includes(query) || 
          email.includes(query) ||
          username.includes(query)
        );
      });
    })
    .catch(error => {
      console.error("Error searching members:", error);
    });
};

const searchWatches = () => {
  adminStore.getWatches()
    .then(() => {
      adminStore.products = adminStore.products.filter(watch => {
        if (!watch) return false;

        // Ensure member properties are defined
        const id = watch.watch_id ? watch.watch_id.toString().toLowerCase() : '' ;
        const name = watch.watch_name ? watch.watch_name.toLowerCase() : '' 
        const seller = watch.seller.user_log_info.username ? watch.seller.user_log_info.username.toLowerCase() : ''

        // Convert query to lower case
        const query = qWatches.value.toLowerCase();

        // Check if any field includes the search query
        return (
          id.includes(query) || 
          name.includes(query) ||
          seller.includes(query)
        );
      });
    })
    .catch(error => {
      console.error("Error searching watches:", error);
    });
};

const searchPendingWatches = () => {
  adminStore.getWatches()
    .then(() => {
      adminStore.products = adminStore.products.filter(watch => {
        if (!watch) return false;
        else if(watch.state === 0){
          // Ensure member properties are defined
          const id = watch.watch_id ? watch.watch_id.toString().toLowerCase() : '' ;
          const name = watch.watch_name ? watch.watch_name.toLowerCase() : '' 
          const seller = watch.seller.user_log_info.username ? watch.seller.user_log_info.username.toLowerCase() : ''
  
          // Convert query to lower case
          const query = qWatches.value.toLowerCase();
  
          // Check if any field includes the search query
          return (
            id.includes(query) || 
            name.includes(query) ||
            seller.includes(query)
          );
        }
      });
    })
    .catch(error => {
      console.error("Error searching watches:", error);
    });
};

const searchOrders = () => {
  adminStore.getOrders()
    .then(() => {
      adminStore.orders = adminStore.orders.filter(order => {
        if (!order) return false;

        // Ensure member properties are defined
        const id = order.order_id ? order.order_id.toString().toLowerCase() : '';
        const receiveName = order.receive_name ? order.receive_name.toLowerCase() : '';
        const date = order.create_time ? new Date(order.create_time).toLocaleDateString().toLowerCase() : '';

        // Convert query to lower case
        const query = qOrders.value.toLowerCase();

        // Check if any field includes the search query
        return (
          id.includes(query) || 
          receiveName.includes(query) ||
          date.includes(query)
        );
      });
    })
    .catch(error => {
      console.error("Error searching orders:", error);
    });
};

// Define a method to promote a user to staff
const promoteToStaff = async (uID) => {

  try {
    const memberExists = await checkMemberExists(uID);
    if (!memberExists) {
      alert("ID người dùng không đúng hoặc không tồn tại");
      return;
    }

    await adminStore.promoteToStaff(uID);
    await adminStore.getMembers();
    alert("Thêm làm nhân viên thành công");
  } catch (error) {
    console.error("Failed to promote user:", error);
    alert("Có lỗi xảy ra khi thêm làm nhân viên");
  }
};

const checkMemberExists = async (id) => {
  try {
    const member = getMember(id);
    return !!member;
  } catch (error) {
    console.error("Error checking member existence:", error);
    return false;
  }
};

// Open the ban modal
const openBanModal = (member) => {
  selectedMember.value = member;
  isBanModalOpen.value = true;
};

// Close the ban modal
const closeBanModal = () => {
  isBanModalOpen.value = false;
  banMessage.value = "";
  selectedMember.value = null;
};
const isLoading = ref(false)
// Confirm ban user

const confirmBanUser = async () => {
  isLoading.value = true;
  if (selectedMember.value) {
    try {
      await useChatStore().registerUser2(selectedMember.value.member_id);
      var user = {
        username: selectedMember.value.user_log_info.username,
        user_id: selectedMember.value.member_id
      }
      await useAdminStore().ban(user, banMessage.value)
      await useMailStore().send(
        selectedMember.value.email,
        "THÔNG BÁO BẠN ĐÃ BỊ BAN KHỎI TIME HARMONY.",
        `Tài khoản mang tên ${selectedMember.value.user_log_info.username} đã bị cấm khỏi nền tảng! Lý do: ${banMessage.value}.`
      );
      
      // Refresh the members list to update the UI
      await adminStore.getMembers();
      
      // Update the specific member in the filteredMembers list
      const index = filteredMembers.value.findIndex(m => m.member_id === selectedMember.value.member_id);
      if (index !== -1) {
        filteredMembers.value[index].user_log_info.enabled = 0;
      }
    } catch (error) {
      console.error("Error banning user:", error);
    } finally {
      closeBanModal();
      isLoading.value = false;
    }
  }
};

const unbanUser = async (member) => {
  try {
    isLoading.value = true;
    await useAdminStore().unBan(member.user_log_info.username);
    
    // Refresh the members list to update the UI
    await adminStore.getMembers();
    
    // Update the specific member in the filteredMembers list
    const index = filteredMembers.value.findIndex(m => m.member_id === member.member_id);
    if (index !== -1) {
      filteredMembers.value[index].user_log_info.enabled = 1;
    }
  } catch (error) {
    console.error("Error unbanning user:", error);
  } finally {
    isLoading.value = false;
  }
};

const sendEmail = async (transactionNo, member_id) => {
  if (transactionNo && member_id) {
    const transaction = filteredNullOrders.value.find(t => t.transaction_no === transactionNo);
    if (!transaction) {
        throw new Error("Transaction not found");
      }
    const u = userStore.loadUser(member_id)
      try {
        useMailStore().send(
          (await u).email,
          "THÔNG BÁO HOÀN TIỀN",
          `Time Harmony xin thông báo: Đơn đặt hàng của người dùng ${(await u).first_name} ${(await u).last_name} được tạo vào thời điểm ${formatDate(transaction.create_at)} với mã giao dịch ${transactionNo} có số tiền: ${currency(transaction.payment_amount)} đã xảy ra lỗi ngoài ý muốn. Chúng tôi xin lỗi về sự cố xảy ra trong quá trình xác nhận đơn hàng. Đơn hàng sẽ được hoàn tiền ngay khi có thể. Xin cảm ơn bạn đã thông cảm và kiên nhẫn đợi.`
          );

        useAdminStore().deleteOrdersNull(transactionNo)
        // Thông báo gửi email thành công
        alert("Email đã được gửi thành công!");
        await adminStore.getOrdersNull();
        // Có thể thêm logic để cập nhật trạng thái giao dịch nếu cần
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
      }
    } else {
      alert("Không tìm thấy thông tin Người Dùng.");
    }
  
};

const mess = (id) => {
  useChatStore().addToChat(id)
  .then(() => {
    window.location.replace('/chat');
  });
};


const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const numSuccessOrder = ref(0);
const totalAmountOrder = ref(0)
const totalAmountProfit = ref(0)


const updateOrderStats = async () => {
      if (selectedMonth.value) {
        try {
          const num = await adminStore.getNumOrderSuccess(selectedMonth.value)
          const order = await adminStore.getTotalAmountOrderSuccess(selectedMonth.value)
          const profit = await adminStore.getTotalProfitOrderSuccess(selectedMonth.value)
          numSuccessOrder.value = num
          totalAmountOrder.value = order
          totalAmountProfit.value = profit
          console.log(`Số đơn đặt thành công trong tháng ${selectedMonth.value}: ${num}`)
        } catch (error) {
          console.error('Lỗi khi lấy số đơn đặt thành công:', error)
          numSuccessOrder.value = 0 // Đặt về 0 nếu có lỗi
        }
      }
    }


//Chart Showing - Monthly Revenue
const currentSection = ref('profit-overview');
const showCharts = ref(false);
const monthlyRevenueChartInstance = ref(null);
const monthlyRevenueChart = ref(null);

// Add date filter refs
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]); // Default to start of current year
const endDate = ref(new Date().toISOString().split('T')[0]); // Default to today

const validateDates = () => {
  if (new Date(startDate.value) > new Date(endDate.value)) {
    startDate.value = endDate.value;
  }
};

watch([startDate, endDate], validateDates);

const fetchAndProcessRevenueData = async (start, end) => {
  try {
    const response = await adminStore.getOrderRevenue(start, end);
    console.log("API Response:", JSON.stringify(response, null, 2));
    
    if (!response || typeof response !== 'object') {
      throw new Error("Invalid response");
    }

    let rawData = Array.isArray(response) ? response : (response.data && Array.isArray(response.data) ? response.data : null);
    if (!rawData) {
      throw new Error("Unable to find array data in response");
    }

    const revenueData = {};

    rawData.forEach(item => {
      if (item && item.date && item.daily_revenue !== undefined) {
        const date = new Date(item.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueData[key] = (revenueData[key] || 0) + parseFloat(item.daily_revenue);
      } else {
        console.warn("Invalid item in rawData:", item);
      }
    });

    return revenueData;
  } catch (err) {
    console.error("Error fetching revenue data:", err);
    error.value = "Failed to fetch revenue data. Please try refreshing the page.";
    return {};
  }
};

const getChartLabels = (start, end) => {
  const labels = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Ensure we include the entire last month
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (currentDate <= endDate) {
    labels.push(`T${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return labels;
};

const createMonthlyRevenueChart = async () => {
  try {
    validateDates();
    let adjustedEndDate = new Date(endDate.value);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const adjustedEndDateString = adjustedEndDate.toISOString().split('T')[0];

    const revenueData = await fetchAndProcessRevenueData(startDate.value, adjustedEndDateString);
    console.log("Processed revenue data:", revenueData);

    if (monthlyRevenueChartInstance.value) monthlyRevenueChartInstance.value.destroy();

    if (!monthlyRevenueChart.value) {
      console.error("Canvas element not found");
      return;
    }

    const labels = getChartLabels(startDate.value, endDate.value);
    const data = labels.map(label => {
      const [month, year] = label.substring(1).split('/');
      const key = `${year}-${month.padStart(2, '0')}`;
      return revenueData[key] || 0;
    });

    const ctx = monthlyRevenueChart.value.getContext('2d');
    monthlyRevenueChartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lợi Nhuận Theo Tháng',
          data: data,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              callback: function(value, index) {
                return labels[index];
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('vi-VN') + ' ₫';
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString('vi-VN') + ' ₫';
                }
                return label;
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Error creating revenue chart:", err);
    error.value = "Failed to create revenue chart. Please try refreshing the page.";
  }
};

const createCharts = async () => {
  if (currentSection.value !== 'profit-overview') return;

  await nextTick();
  showCharts.value = true;
  await nextTick();
  await createMonthlyRevenueChart();
};

const updateChart = async () => {
  if (currentSection.value === 'profit-overview') {
    await createMonthlyRevenueChart();
  }
};

watch(currentSection, async (newSection, oldSection) => {
  if (newSection === 'profit-overview') {
    if (oldSection !== 'profit-overview') {
      showCharts.value = false;
      await nextTick();
      await createCharts();
    }
  } else {
    showCharts.value = false;
  }
});

//Chart Showing - Daily Revenue (7 days)

const profitChart = ref(null)
const chartInstance = ref(null)
const startDailyDate = ref('')
const endDailyDate = ref('')
const currentDate = computed(() => new Date().toISOString().split('T')[0])
const maxstartDailyDate = computed(() => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]
})

const totalProfit = ref(0)

const formatValue = (value, isCurrency) => {
  if (isCurrency) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
  return value
}

const updateProfitChart = (data) => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  if (!profitChart.value) {
    console.error("Canvas element not found")
    return
  }
  const ctx = profitChart.value.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Doanh thu theo ngày',
          data: data.map(item => item.profit),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Số lượng đơn hàng',
          data: data.map(item => item.quantity),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: 'Biểu đồ doanh thu và số lượng đơn hàng'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Doanh thu (VNĐ)'
          },
          ticks: {
            callback: (value) => formatValue(value, true)
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Số lượng đơn hàng',
            font: {
              size: 14
            }
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            stepSize: 1,
            beginAtZero: true,
            precision: 0,
            font: {
              size: 12
            }
          },
          suggestedMin: 0,
          suggestedMax: Math.max(...data.map(item => item.quantity)) + 1
        },
      }
    },
  })
}

const apiendDailyDate = ref('')

const updateendDailyDate = () => {
  const start = new Date(startDailyDate.value)
  let end = new Date(start)
  end.setDate(end.getDate() + 7)
  
  const currentDateObj = new Date(currentDate.value)
  if (end > currentDateObj) {
    end = currentDateObj
  }
  
  endDailyDate.value = end.toISOString().split('T')[0]
  
  // Set apiendDailyDate to one day after endDailyDate
  const apiEnd = new Date(end)
  apiEnd.setDate(apiEnd.getDate() + 1)
  apiendDailyDate.value = apiEnd.toISOString().split('T')[0]
  
  updateDailyChart()
}

const updateDailyChart = () => {
  if (startDailyDate.value && endDailyDate.value) {
    fetchAndProcessProfitData(startDailyDate.value, endDailyDate.value, apiendDailyDate.value)
  }
}
const fetchAndProcessProfitData = async (start, end, apiEnd) => {
  try {
    const [revenueResponse, orderResponse] = await Promise.all([
      adminStore.getOrderRevenue(start, apiEnd),
      adminStore.getDailySuccessOrder(start, apiEnd)
    ])

    console.log("Revenue API Response:", JSON.stringify(revenueResponse, null, 2))
    console.log("Order API Response:", JSON.stringify(orderResponse, null, 2))

    if (!Array.isArray(revenueResponse) || !Array.isArray(orderResponse)) {
      throw new Error("Unexpected response format")
    }

    // Aggregate revenue and order data
    const aggregatedData = {}

    revenueResponse.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0]
      if (!aggregatedData[date]) {
        aggregatedData[date] = { profit: 0, quantity: 0 }
      }
      if ('daily_revenue' in item) {
        aggregatedData[date].profit += item.daily_revenue
      } else if ('daily_profit' in item) {
        aggregatedData[date].profit += item.daily_profit
      } else if ('profit' in item) {
        aggregatedData[date].profit += item.profit
      } else {
        console.warn(`Unexpected profit data structure for date ${date}:`, item)
      }
    })

    orderResponse.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0]
      if (!aggregatedData[date]) {
        aggregatedData[date] = { profit: 0, quantity: 0 }
      }
      aggregatedData[date].quantity += item.quantity_order
    })

    const startDate = new Date(start)
    const endDate = new Date(end)
    const combinedData = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0]
      combinedData.push({
        date: currentDate,
        profit: aggregatedData[currentDate]?.profit || 0,
        quantity: aggregatedData[currentDate]?.quantity || 0
      })
    }

    console.log("Processed combinedData:", JSON.stringify(combinedData, null, 2))

    totalProfit.value = combinedData.reduce((sum, item) => sum + item.profit, 0)

    updateProfitChart(combinedData)
  } catch (err) {
    console.error("Error fetching and processing data:", err)
    error.value = "Failed to fetch and process data. Please try refreshing the page."
  }
}

//Chart daily





// Format currency
const currency = (value) => {
  if (value === undefined || value === null) {
    return '0 ₫';
  }
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN')
};

const formatDateNoTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const formatDateWithoutTime = (dateString) => {
  if (!dateString) return 'Chưa có ngày';
  
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  const day = utcDate.getUTCDate();
  const month = utcDate.getUTCMonth() + 1;
  const year = utcDate.getUTCFullYear();
  
  // Định dạng ngày tháng theo kiểu Việt Nam
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

</script>

<style scoped>

.newmessnoti {
  animation: blink 1s infinite; /* Áp dụng animation chớp chớp */
}

.filter-panel {
  width: 100%;
  max-width: 100px;
}

.back{
  background: linear-gradient(to bottom, #3b3638, #40413a);
}

.appraiser-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.appraiser-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
}

.appraiser-item:hover {
  background-color: #f0f0f0;
}

.appraiser-item.selected {
  background-color: var(--primary);
  color: white;
}

.date-picker {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.confirm-btn {
  background-color: var(--primary);
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #ccc;
}


.disabled-btn {
  border: 1px solid #888;
  background-color: #888;
  cursor: not-allowed;
}

.admin-page {
  background-color: #212121;
  color: var(--secondary);
}

.chart-grid {
  display: flex;
  justify-content: space-between;
}

.chart-container, .chart-container-large {
  flex: 1;
  height: 300px; /* hoặc kích thước phù hợp khác */
}

.chart-container-large {
  height: 500px;
  width: 100%;
  margin-top: 20px;
}

.table-container {
  overflow-x: auto;
  max-height: 400px; /* Adjust this value as needed */
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: var(--primary);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10; /* Ensure the table header is above the table rows */
}

.table th,
.table td {
  padding: 8px;
  border: 1px solid var(--secondary);
}

.table-header th {
  background-color: #494949; /* Matches your background color */
}

.table tbody tr:nth-child(even) {
  background-color: #333;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #ffbd59;
}

.profit-container {
  color: var(--secondary);
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(5px);
  background: rgba(
    23,
    23,
    23,
    0.5
  );  z-index: 1000; /* Ensure the modal is above all other content */
}

.modal-content {
  background-color: #181818;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #181818;
}

.confirm-btn {
  margin-top: 10px;
  background-color: var(--primary);
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.ui-input-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.ui-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  font-size: 1em;
  border: none;
  border-bottom: 2px solid #ccc;
  background-color: transparent;
  transition: border-color 0.3s, background-color 0.3s, padding 0.3s;
}

.ui-input:focus {
  border-color: var(--secondary);

  padding: 10px 10px 10px 40px; /* Ensuring the padding remains the same on focus */
}

.ui-input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: var(--primary);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.ui-input:focus + .ui-input-underline {
  transform: scaleX(1);
}

.ui-input-highlight {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 0;
  background-color: var(--back);
  transition: width 0.3s;
}

.ui-input:focus ~ .ui-input-highlight {
  width: 100%;
}

.ui-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  transition: color 0.3s;
}

.ui-input:focus ~ .ui-input-icon {
  color: #e6c591;
}

.ui-input-icon svg {
  width: 20px;
  height: 20px;
}


.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 9999;
}
.loader-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  background: rgba(
    23,
    23,
    23,
    0.5
  ); /* Adjust the alpha value for transparency */
}

.loader {
  width: 80px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  position: relative;
  padding: 1px;
}

.loader .loaderBar {
  position: absolute;
  top: 0;
  right: 100%;
  bottom: 0;
  left: 0;
  background: var(--secondary);
  width: 0;
  animation: borealisBar 2s linear infinite;
}



.loader::after {
  content: "";
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 2px solid var(--secondary);
  left: 0;
  top: 0;
  animation: rotation 2s ease-in-out infinite alternate;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.promoteBox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background: rgba(
    23,
    23,
    23,
    0.5
  );
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  gap: 3px;
}

.promote {
  background-color: #1b1b1b;
  padding: 30px; /* Tăng padding từ 20px lên 30px */
  gap: 10px; /* Tăng gap nếu cần */
  min-width: 300px; /* Tăng chiều rộng tối thiểu nếu cần */
}

.promote select {
  background-color: rgba(63, 55, 55 ,0.1);
  color: var(--secondary);
  border: 1px solid var(--secondary);
  gap: 5px;
}

.promote select option {
  background-color: rgba(63, 55, 55);
  color: var(--primary);
  border: 0px solid var(--secondary);
}
</style>
