import { defineStore } from "pinia";
import axios from "axios";

var api = import.meta.env.VITE_API_PORT
export const useWatchStore = defineStore("watch", {
  state: () => ({
    watches: new Map(),
    totalPage: 0,
    currentPage: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    filters: [],
    searchResults: [],
    watch_data: {
      watch_id: null,
      seller: null,
      watch_name: "",
      watch_description: "",
      image_url: [],
      state: 0,
      price: null,
      brand: "",
      series: "",
      model: "",
      gender: "",
      style_type: "",
      sub_class: "",
      made_label: "",
      calender: "",
      feature: "",
      movement: "",
      functions: "",
      engine: "",
      water_resistant: "",
      band_color: "",
      band_type: "",
      clasp: "",
      bracelet: "",
      dial_type: "",
      dial_color: "",
      crystal: "",
      second_makers: "",
      bezel: "",
      bezel_material: "",
      case_back: "",
      case_dimension: "",
      case_shape: "",
      appraised_by: null
    }
  }),

  actions: {
    async getWatchesOfPage(page, keyword, filters = []) {
      this.isLoading = true;
      this.error = null;
    
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(this.filters);
    
      if (filtersChanged) {
        this.watches.clear();
        this.filters = filters;
      }
    
      let url = `${api}/watch/get/watch-page?page=${page}&keyword=${keyword}`;
      if (filters.length > 0) {
        url += `&${filters.join("&")}`;
      }
      console.log(url);
    
      try {
        const response = await axios.get(url);
        
        if (response.data && Array.isArray(response.data.watches) && response.data.watches.length > 0) {
          // Replace the watches array for the current page
          this.watches.set(page, response.data.watches);
          this.currentPage = page;
    
          const totalPages = Math.ceil(response.data.watch_num / 60);
          this.totalPage = totalPages;
          this.hasMore = page < totalPages - 1;
    
          console.log("Fetched watches for page:", page);
          console.log("Total Pages:", this.totalPage);
          console.log(response);
        } else {
          console.log("No watches found for page:", page);
          this.hasMore = false;
        }
      } catch (error) {
        console.error("Error fetching watches:", error);
        this.error = error.message || "Failed to fetch watches";
      } finally {
        this.isLoading = false;
      }
    },    

    async uploadWatch(seller_id, username) {
      try {
        axios.post(`${api}/member/to-seller?id=${seller_id}&username=${username}`);
        const response = await axios.post(
          `${api}/seller/create/watch?seller_id=${seller_id}`,
          this.watch_data
        );
        console.log("Upload successful", response);
        return response;
      } catch (error) {
        console.error("Upload error", error);
        throw error;
      }
    },

    async loadWatch(watchData) {
      try {
        this.watch_data = {
          ...this.watch_data,
          ...watchData
        };
      } catch (err) {
        console.error("Error fetching member data:", err);
      }
    },

    async getDetailWatch(watch_id) {
      try {
        const response = await axios.get(`${api}/watch/get/${watch_id}`);
        const res = response.data;
        console.log(res);
        
        if (res.watch) {
          console.log("API image_url:", res.watch.image_url);

          this.watch_data = {
            watch_id: res.watch.watch_id,
            seller: res.watch.seller,
            watch_name: res.watch.watch_name,
            watch_description: res.watch.watch_description,
            image_url: res.watch.image_url ? (Array.isArray(res.watch.image_url) ? res.watch.image_url : [res.watch.image_url]) : [],
            watch_create_date: res.watch.watch_create_date,
            watch_approval_date: res.watch.watch_approval_date,
            state: res.watch.state,
            price: res.watch.price,
            brand: res.watch.brand,
            series: res.watch.series,
            model: res.watch.model,
            gender: res.watch.gender,
            style_type: res.watch.style_type,
            sub_class: res.watch.sub_class,
            made_label: res.watch.made_label,
            calender: res.watch.calender,
            feature: res.watch.feature,
            movement: res.watch.movement,
            functions: res.watch.functions,
            engine: res.watch.engine,
            water_resistant: res.watch.water_resistant,
            band_color: res.watch.band_color,
            band_type: res.watch.band_type,
            clasp: res.watch.clasp,
            bracelet: res.watch.bracelet,
            dial_type: res.watch.dial_type,
            dial_color: res.watch.dial_color,
            crystal: res.watch.crystal,
            second_makers: res.watch.second_makers,
            bezel: res.watch.bezel,
            bezel_material: res.watch.bezel_material,
            case_back: res.watch.case_back,
            case_dimension: res.watch.case_dimension,
            case_shape: res.watch.case_shape,
            appraised_by: res.appraised_by
          };
          console.log("Image URL:", this.watch_data.image_url);

        } else {
          console.error("Watch data not found in the response");
          this.error = "Watch data not found";
        }
    
        return this.watch_data;
      } catch (error) {
        console.error("Error fetching watch data:", error);
        this.error = error.message || "Failed to fetch watch data";
        throw error;
      }
    },
    async searchWatches(keyword) {
      try {
        const response = await axios.get(`${api}/watch/search/keyword?keyword=${keyword}`);
        this.searchResults = response.data;
        console.log(response.data);
        return this.searchResults;
      } catch (error) {
        console.error("Error searching watches:", error);
        throw error;
      }
    },
    async getWatchesByGender(gender) {
      try {
        const response = await axios.get(`${api}/watch/get/gender?gender=${gender}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by gender:", error);
        throw error;
      }
    },
  
    async getWatchesBySeries(series) {
      try {
        const response = await axios.get(`${api}/watch/get/series?series=${series}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by series:", error);
        throw error;
      }
    },
  
    async getWatchesByBrand(brand) {
      try {
        const response = await axios.get(`${api}/watch/get/brand?brand=${brand}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by brand:", error);
        throw error;
      }
    },
  
    async getWatchesByStyle(style) {
      try {
        const response = await axios.get(`${api}/watch/get/style?style=${style}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by style:", error);
        throw error;
      }
    },
  
    async getWatchesByPriceRange(leftLimit, rightLimit) {
      try {
        const response = await axios.get(`${api}/watch/get/watch-in-range-price?leftlimit=${leftLimit}&rightlimit=${rightLimit}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by price range:", error);
        throw error;
      }
    },
  
    // Add a new action to apply multiple filters
    async applyFilters(filters) {
      try {
        let results = [];
        if (filters.gender) {
          results = await this.getWatchesByGender(filters.gender);
        }
        if (filters.brand) {
          const brandResults = await this.getWatchesByBrand(filters.brand);
          results = results.length ? results.filter(watch => brandResults.some(br => br.watch_id === watch.watch_id)) : brandResults;
        }
        if (filters.style) {
          const styleResults = await this.getWatchesByStyle(filters.style);
          results = results.length ? results.filter(watch => styleResults.some(sr => sr.watch_id === watch.watch_id)) : styleResults;
        }
        if (filters.priceRange) {
          const priceResults = await this.getWatchesByPriceRange(filters.priceRange.min, filters.priceRange.max);
          results = results.length ? results.filter(watch => priceResults.some(pr => pr.watch_id === watch.watch_id)) : priceResults;
        }
        this.searchResults = results;
        return results;
      } catch (error) {
        console.error("Error applying filters:", error);
        throw error;
      }
    },

    async deleteWatch(seller_id,wid) {
      try {
        const response = await axios.delete(`${api}/seller/delete/watch/${seller_id}?wid=${wid}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching watches by series:", error);
        throw error;
      }
    },

    createRequestWatch(seller_id, watch_id, note, date){
      console.log("seller: ", seller_id);
      console.log("watch id: ", watch_id);
      console.log("note: ", note);
      console.log("date: ", date);

      axios.post(`${api}/seller/create/appraise-request/${seller_id}`,{
        watch_id: watch_id,
        note: note,
        appoinment_date: date
      })
      .then((res)=>{
        console.log(res);  
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  }
});
