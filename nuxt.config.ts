export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Evolv — creator-led learning",
      meta: [
        { name: "description", content: "Build adaptive courses from your approved knowledge, in your voice, with human review." }
      ]
    }
  }
})
