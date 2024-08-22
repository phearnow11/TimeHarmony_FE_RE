import { defineStore } from "pinia";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
var api = import.meta.env.VITE_API_PORT

const supabaseUrl = import.meta.env.VITE_SUPABASEURL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASEANONKEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useMailStore = defineStore("mail", {
  state: () => ({

  }),
  actions: {
    send(email, subject, content){
        axios.post(`${api}/mail/send-to/${email}`,{
            subject: subject,
            content: content
        })
        .then(res=>{
            console.log(res);
        })
    },
    sendAttach(email, subject, content, attach){
        axios.post(`${api}/mail/send-to/attachment/${email}`,{
            subject: subject,
            content: content,
            path_attachment: attach 
        })
        .then(res=>{
            console.log(res);
        })
    },
    sendVerifyToEmail(user_id, email, code) {
        supabase
          .from('verify_email')
          .insert({
            user_id: user_id,
            email: email,
            code: code,
            isVerify: false
          })
          .then(response => {
            console.log("Verification email sent:", response);
          })
          .catch(error => {
            console.error("Error sending verification email:", error);
          });
      }  ,
      async deleteVerify(user_id) {
        try {
          const { data, error } = await supabase
            .from('verify_email')
            .delete()
            .eq('user_id', user_id);
      
          if (error) {
            console.error("Error deleting verification record:", error.message);
          } else {
            console.log("Verification record deleted successfully:", data);
          }
        } catch (error) {
          console.error("Error deleting verification record:", error.message);
        }
      }
    ,
    async findVerify(user_id, code) {
        // Check if the record exists
        const { data, error } = await supabase
          .from('verify_email')
          .select('user_id')
          .eq('user_id', user_id)
          .eq('code', code);
      
        if (error) {
          console.error("Error finding verification:", error);
          return false;
        }
      
        // If record exists, update it
        if (data.length > 0) {
          const { error: updateError } = await supabase
            .from('verify_email')
            .update({ isVerify: true }) // Update the field to true
            .eq('user_id', user_id)
            .eq('code', code);
      
          if (updateError) {
            console.error("Error updating verification:", updateError);
            return false;
          }
      
          return true; // Update successful
        }
      
        return false; // No matching record found
      },
      async checkVerify(user_id) {
        const { data, error } = await supabase
          .from('verify_email')
          .select('isVerify')
          .eq('user_id', user_id)
          .single(); // Fetch a single record
      
        if (error) {
          console.error("Error checking verification status:", error);
          return false; // Return false in case of an error
        }
      
        // Return the isVerify status
        return data?.isVerify === true;
      }      
  }      
});
