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
      <h2 class="text-2xl mt-4 text-primary relative bottom-4">Thống kê thu nhập và đơn hàng</h2>

      <!-- Date Selection -->
      <div class="flex items-center mb-6">
        <label class="mr-3" for="startDailyDate">Từ</label>
        <input 
          type="date" 
          id="startDailyDate" 
          v-model="startDailyDate" 
          :max="maxstartDailyDate"
          @change="updateendDailyDate"
          class="p-2 border bg-black-99 rounded"
        >
        
        <label class="mx-5" for="endDailyDate">Đến</label>
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
      <div class="container mx-auto p-4">
        <div class="p-1">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="p-4 shadow col-span-3">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 flex items-center justify-center bg-purple-500">
                    <i class="fas fa-dollar-sign text-white text-xl"></i>
                  </div>
                  <span>Doanh thu và Đơn hàng theo ngày</span>
                </div>
              </div>
              <div class="h-64">
                <canvas ref="profitChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth.js'
import { useAdminStore } from '../stores/admin'

const userStore = useUserStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

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
            text: 'Số lượng đơn hàng'
          },
          grid: {
            drawOnChartArea: false,
          },
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

    const startDate = new Date(start)
    const endDate = new Date(end)
    const combinedData = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0]
      const revenueEntry = revenueResponse.find(item => new Date(item.date).toISOString().split('T')[0] === currentDate)
      const orderEntry = orderResponse.find(item => new Date(item.date).toISOString().split('T')[0] === currentDate)
      
      let profit = 0
      if (revenueEntry) {
        if ('daily_revenue' in revenueEntry) {
          profit = revenueEntry.daily_revenue
        } else if ('daily_profit' in revenueEntry) {
          profit = revenueEntry.daily_profit
        } else if ('profit' in revenueEntry) {
          profit = revenueEntry.profit
        } else {
          console.warn(`Unexpected profit data structure for date ${currentDate}:`, revenueEntry)
        }
      }
      
      combinedData.push({
        date: currentDate,
        profit: profit,
        quantity: orderEntry ? orderEntry.quantity_order : 0
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

onMounted(async () => {
  // Set default date range to last 7 days
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
})
</script>