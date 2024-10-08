<template>
  <div class="mx-auto p-6 flex flex-col lg:flex-row">
    <!-- Thanh bên -->
    <aside class="lg:w-1/4 lg:mr-8 p-4">
      <h2 class="text-2xl text-secondary mb-4">Cài đặt Hồ sơ</h2>
      <ul class="space-y-2">
        <li><router-link to="/setting/profile" class="hover-underline-animation">Thông tin cá nhân</router-link></li>
        <li><router-link to="/setting/password" class="hover-underline-animation">Mật khẩu</router-link></li>
        <li><router-link to="/setting/address" class="hover-underline-animation">Sổ địa chỉ</router-link></li>
        <li><router-link to="/setting/product" class="hover-underline-animation">Đơn hàng của tôi</router-link></li>
        <li class="text-secondary">Thu nhập</li>
        <li><router-link to="/setting/delete" class="hover-underline-animation-r">Xoá tài khoản</router-link></li>
      </ul>
    </aside>
    
  <div class="flex-1">
    <h2 class="text-2xl mt-4 text-primary relative bottom-4">Thống kê thu nhập</h2>
      <!-- Date Selection -->
      <div class="flex items-center mb-6">
        <label class="mr-3" for="startDate">Từ</label>
        <input 
          type="date" 
          id="startDate" 
          :value="startDate"
          :max="maxStartDate"
          @input="updateStartDate($event.target.value)"
          class="p-2 border bg-black-99 rounded"
        >
        
        <label class="mx-5" for="endDate">Đến</label>
        <input 
          type="date" 
          id="endDate" 
          :value="endDate"
          disabled
          :min="startDate"
          :max="currentDate"
          class="p-2 border bg-black-99 rounded"
        >
      </div>
    <div class="container mx-auto p-4">
      <div class="p-1">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="p-4 shadow col-span-3">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 flex items-center justify-center bg-purple-500">
                  <i class="fas fa-dollar-sign text-white text-xl"></i>
                </div>
                <span>Doanh thu theo ngày</span>
              </div>
            </div>
            <div class="h-64">
              <canvas ref="profitChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-full">
      <!-- Posted Watches -->
      <div class="p-4 mr-5 shadow w-1/2">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 flex items-center justify-center bg-blue-500">
              <i class="fas fa-upload text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold">{{ postedWatches }}</h3>
              <p class="text-sm text-gray-99">Sản phẩm đã đăng</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sold Watches -->
      <div class="p-4 shadow w-1/2">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 flex items-center justify-center bg-yellow-500">
              <i class="fas fa-shopping-cart text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold">{{ soldWatches }}</h3>
              <p class="text-sm text-gray-99">Sản phẩm đã bán</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useUserStore } from '../../stores/user'
import { useAuthStore } from '../../stores/auth.js'

const userStore = useUserStore()
const authStore = useAuthStore()

const profitChart = ref(null) //lưu trữ tham chiếu đến phần tử canvas trong DOM
const chartInstance = ref(null) //một ref để lưu trữ instance của biểu đồ Chart.js.
const startDate = ref('')
const endDate = ref('')
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

const updateStartDate = (value) => {
  startDate.value = value
  updateEndDate()
}

const maxStartDate = computed(() => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() - 7)
  return formatDate(date)
})

const totalProfit = ref(0)
const postedWatches = ref(0)
const soldWatches = ref(0)
const error = ref(null)

const formatValue = (value, isCurrency) => {
  if (isCurrency) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
  return value
}

const updateProfitChart = (labels, data) => {
  //Kiểm tra và hủy biểu đồ cũ nếu tồn tại
  //Không tạo nhiều biểu đồ chồng lên nhau
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = profitChart.value.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Doanh thu theo ngày',
        data: data,
        backgroundColor: 'rgba(144, 97, 249, 0.6)',
        borderColor: 'rgb(144, 97, 249)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatValue(value, true)
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => formatValue(context.parsed.y, true)
          }
        }
      }
    }
  })
}

const apiEndDate = ref('')

const updateEndDate = () => {
  const start = new Date(startDate.value)
  let end = new Date(start)
  end.setDate(end.getDate() + 7)
  
  const currentDateObj = new Date(currentDate.value)
  if (end > currentDateObj) {
    end = currentDateObj
  }

  endDate.value = formatDate(end)
  
  // Set apiEndDate to one day after endDate
  const apiEnd = new Date(end)
  apiEnd.setDate(apiEnd.getDate() + 1)
  apiEndDate.value = formatDate(apiEnd)
  
  updateChart()
}

const updateChart = () => {
  if (startDate.value && endDate.value) {
    fetchAndProcessProfitData(startDate.value, endDate.value, apiEndDate.value)
  }
}

const fetchAndProcessProfitData = async (start, end, apiEnd) => {
  try {
    const sellerId = authStore.user_id
    const response = await userStore.getProfitOfSellerByDate(sellerId, start, apiEnd)
    console.log("API Response:", JSON.stringify(response, null, 2))

    if (!Array.isArray(response)) {
      throw new Error("Unexpected response format")
    }

    // Aggregate profits for each unique date
    const aggregatedProfits = response.reduce((acc, item) => {
      const date = new Date(item.date)
      const dateString = formatDate(date)
      if (!acc[dateString]) {
        acc[dateString] = 0
      }
      acc[dateString] += item.daily_profit
      return acc
    }, {})

    const startDate = new Date(start)
    const endDate = new Date(end)
    const dailyProfits = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = formatDate(d)
      dailyProfits.push({
        date: currentDate,
        profit: aggregatedProfits[currentDate] || 0
      })
    }

    totalProfit.value = dailyProfits.reduce((sum, item) => sum + item.profit, 0)

    const labels = dailyProfits.map(item => item.date)
    const data = dailyProfits.map(item => item.profit)

    updateProfitChart(labels, data)
  } catch (err) {
    console.error("Error fetching profit data:", err)
    error.value = "Failed to fetch profit data. Please try refreshing the page."
  }
}

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
onMounted(async () => {
  const sellerId = authStore.user_id
  
  // Set default date range to last 7 days
  const today = new Date()
  endDate.value = formatDate(today)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  startDate.value = formatDate(sevenDaysAgo)

  // Set apiEndDate to one day after endDate
  const apiEnd = new Date(today)
  apiEnd.setDate(apiEnd.getDate() + 1)
  apiEndDate.value = formatDate(apiEnd)

  try {
    if (profitChart.value) {
      await fetchAndProcessProfitData(startDate.value, endDate.value, apiEndDate.value)
    }

    // Fetch posted and sold watches data
    postedWatches.value = await userStore.countPostWatch(sellerId)
    soldWatches.value = await userStore.countSoldWatch(sellerId)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>