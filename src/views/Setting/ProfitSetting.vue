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
          v-model="startDate" 
          :max="maxStartDate"
          @change="updateEndDate"
          class="p-2 border bg-black-99 rounded"
        >
        
        <label class="mx-5" for="endDate">Đến</label>
        <input 
          type="date" 
          id="endDate" 
          v-model="endDate" 
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

const profitChart = ref(null)
const chartInstance = ref(null)
const startDate = ref('')
const endDate = ref('')
const currentDate = computed(() => new Date().toISOString().split('T')[0])
const maxStartDate = computed(() => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]
})

const totalProfit = ref(0)
const profitData = ref([])
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
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = profitChart.value.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
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

const updateEndDate = () => {
  const start = new Date(startDate.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  
  if (end > new Date(currentDate.value)) {
    end = new Date(currentDate.value)
  }
  
  endDate.value = end.toISOString().split('T')[0]
  updateChart()
}

const updateChart = () => {
  if (startDate.value && endDate.value) {
    fetchAndProcessProfitData(startDate.value, endDate.value)
  }
}

const fetchAndProcessProfitData = async (start, end) => {
  try {
    const sellerId = authStore.user_id
    const response = await userStore.getProfitOfSellerByDate(sellerId, start, end)
    console.log("API Response:", JSON.stringify(response, null, 2))

    if (!Array.isArray(response)) {
      throw new Error("Unexpected response format")
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    const dailyProfits = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0]
      const profitEntry = response.find(item => new Date(item.date).toISOString().split('T')[0] === currentDate)
      dailyProfits.push({
        date: currentDate,
        profit: profitEntry ? profitEntry.daily_profit : 0
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

onMounted(async () => {
  const sellerId = authStore.user_id

  // Set default date range to last 7 days
  const today = new Date()
  endDate.value = today.toISOString().split('T')[0]
  const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))
  startDate.value = sevenDaysAgo.toISOString().split('T')[0]

  try {
    if (profitChart.value) {
      await fetchAndProcessProfitData(startDate.value, endDate.value)
    }

    // Fetch posted and sold watches data
    postedWatches.value = await userStore.countPostWatch(sellerId)
    soldWatches.value = await userStore.countSoldWatch(sellerId)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>