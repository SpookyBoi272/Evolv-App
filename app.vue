<script setup lang="ts">
type Page = 'Overview' | 'My courses' | 'Knowledge library' | 'Review queue' | 'Learners'
type CourseStatus = 'Published' | 'In review' | 'Draft'

interface Course {
  title: string
  category: string
  lessons: number
  learners: number
  completion: number
  status: CourseStatus
  initials: string
  color: string
}

interface Source {
  name: string
  kind: string
  updated: string
  lessons: number
}

interface ReviewItem {
  title: string
  course: string
  detail: string
  initials: string
  color: string
}

const pages: Page[] = ['Overview', 'My courses', 'Knowledge library', 'Review queue', 'Learners']
const activePage = ref<Page>('Overview')
const mobileMenuOpen = ref(false)
const searchQuery = ref('')
const createModalOpen = ref(false)
const learnerPreviewOpen = ref(false)
const learnerExplanation = ref<'simple' | 'example'>('simple')
const learnerConfidence = ref<number | null>(null)
const humanHelpRequested = ref(false)
const learnerLessonCompleted = ref(false)
const dragActive = ref(false)
const newCourseTitle = ref('')
const newCourseCategory = ref('Creator business')
const announcement = ref('')

const courses = ref<Course[]>([
  { title: 'The Creator Growth System', category: 'Creator business', lessons: 12, learners: 248, completion: 76, status: 'Published', initials: 'CG', color: 'peach' },
  { title: 'Build a Brand People Trust', category: 'Brand strategy', lessons: 8, learners: 186, completion: 68, status: 'Published', initials: 'BT', color: 'lavender' },
  { title: 'Your First Digital Offer', category: 'Course creation', lessons: 6, learners: 94, completion: 0, status: 'In review', initials: 'DO', color: 'mint' },
])

const sources = ref<Source[]>([
  { name: 'The Growth Framework — workshop', kind: 'Video · 48 min', updated: 'Updated 2 days ago', lessons: 4 },
  { name: 'Brand voice & positioning guide', kind: 'PDF · 18 pages', updated: 'Updated 5 days ago', lessons: 3 },
  { name: 'Client transformation stories', kind: 'Document · 12 pages', updated: 'Updated 1 week ago', lessons: 2 },
  { name: 'Q&A: audience building', kind: 'Transcript · 34 min', updated: 'Updated 2 weeks ago', lessons: 5 },
])

const reviewItems = ref<ReviewItem[]>([
  { title: 'Finding your point of difference', course: 'Your First Digital Offer', detail: '3 quality checks complete · 1 needs a human review', initials: 'JD', color: 'mint' },
  { title: 'Positioning that feels like you', course: 'Build a Brand People Trust', detail: 'Source updated · 2 lessons may be affected', initials: 'JD', color: 'lavender' },
])

const learners = [
  { name: 'Alex Morgan', email: 'alex.morgan@email.com', course: 'The Creator Growth System', progress: 82, activity: 'Today', initials: 'AM', color: 'peach', needsHelp: false },
  { name: 'Sam Taylor', email: 'sam.taylor@email.com', course: 'Build a Brand People Trust', progress: 46, activity: 'Today', initials: 'ST', color: 'lavender', needsHelp: true },
  { name: 'Jamie Lee', email: 'jamie.lee@email.com', course: 'The Creator Growth System', progress: 71, activity: 'Yesterday', initials: 'JL', color: 'mint', needsHelp: false },
  { name: 'Riley Chen', email: 'riley.chen@email.com', course: 'Your First Digital Offer', progress: 18, activity: '2 days ago', initials: 'RC', color: 'blue', needsHelp: true },
]

const filteredCourses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return courses.value.filter(course => !query || `${course.title} ${course.category}`.toLowerCase().includes(query))
})

const visiblePageTitle = computed(() => activePage.value === 'Overview' ? 'Good morning, Jordan' : activePage.value)

function navigate(page: Page) {
  activePage.value = page
  mobileMenuOpen.value = false
  searchQuery.value = ''
}

function openLearnerPreview() {
  learnerExplanation.value = 'simple'
  learnerConfidence.value = null
  humanHelpRequested.value = false
  learnerLessonCompleted.value = false
  learnerPreviewOpen.value = true
}

function completeLearnerLesson() {
  learnerLessonCompleted.value = true
  learnerConfidence.value = 2
}

function createCourse() {
  const title = newCourseTitle.value.trim()
  if (!title) return

  courses.value.unshift({
    title,
    category: newCourseCategory.value,
    lessons: 0,
    learners: 0,
    completion: 0,
    status: 'Draft',
    initials: title.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(),
    color: 'blue',
  })
  newCourseTitle.value = ''
  createModalOpen.value = false
  navigate('My courses')
  announcement.value = `"${title}" was added to your drafts.`
}

function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  addSources(Array.from(input.files ?? []))
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dragActive.value = false
  addSources(Array.from(event.dataTransfer?.files ?? []))
}

function addSources(files: File[]) {
  for (const file of files) {
    sources.value.unshift({
      name: file.name,
      kind: `${file.type.startsWith('video/') ? 'Video' : file.type.includes('pdf') ? 'PDF' : 'File'} · ${(file.size / 1024 / 1024).toFixed(1)} MB`,
      updated: 'Added just now · not uploaded',
      lessons: 0,
    })
  }
  if (files.length) {
    announcement.value = `${files.length} source${files.length === 1 ? '' : 's'} added to this local demo. Connect the API to upload and process files.`
  }
}

function approveReview(index: number) {
  const [item] = reviewItems.value.splice(index, 1)
  if (!item) return
  announcement.value = `"${item.title}" passed human review in this demo.`
}

function requestChanges(index: number) {
  const item = reviewItems.value[index]
  if (!item) return
  announcement.value = `A revision was requested for "${item.title}".`
}
</script>

<template>
  <div class="app-shell">
    <button v-if="mobileMenuOpen" class="mobile-backdrop" aria-label="Close navigation" @click="mobileMenuOpen = false" />
    <aside class="sidebar" :class="{ 'sidebar-open': mobileMenuOpen }">
      <a class="brand" href="#" aria-label="Evolv home" @click.prevent="navigate('Overview')">
        <span class="brand-mark"><span /></span>
        <span class="brand-name">evolv<span class="brand-period">.</span></span>
      </a>

      <div class="workspace-switcher">
        <div class="workspace-avatar">JG</div>
        <div class="workspace-copy">
          <strong>The Growth Studio</strong>
          <span>Creator workspace</span>
        </div>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
      </div>

      <div class="nav-label">WORKSPACE</div>
      <nav class="main-nav" aria-label="Main navigation">
        <button v-for="(page, index) in pages" :key="page" class="nav-link" :class="{ active: activePage === page }" @click="navigate(page)">
          <svg v-if="index === 0" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
          <svg v-else-if="index === 1" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></svg>
          <svg v-else-if="index === 2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" /><path d="m4.5 8.3 7.5 4.3 7.5-4.3M12 12.6v7.5" /></svg>
          <svg v-else-if="index === 3" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5z" /><path d="m8 12 2.5 2.5L16 9M8 8h2" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19zM16 5.5a3 3 0 0 1 0 5.8M17 13.2a4.8 4.8 0 0 1 3.5 4.6V19h-3" /></svg>
          <span>{{ page }}</span>
          <span v-if="page === 'Review queue' && reviewItems.length" class="nav-count">{{ reviewItems.length }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="help-card">
          <div class="help-icon">✳</div>
          <strong>Your voice, your rules.</strong>
          <p>AI lessons stay grounded in the content you approve.</p>
          <button @click="navigate('Knowledge library')">Explore your library <span>→</span></button>
        </div>
        <button class="profile-button">
          <div class="avatar avatar-creator">JD</div>
          <div class="profile-copy"><strong>Jordan Davis</strong><span>Creator Pro</span></div>
          <span class="profile-more">···</span>
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <button class="mobile-menu-button" aria-label="Open navigation" @click="mobileMenuOpen = true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div class="breadcrumbs"><span>The Growth Studio</span><span class="crumb-slash">/</span><strong>{{ activePage }}</strong></div>
        <div class="topbar-actions">
          <label class="search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></svg>
            <input v-model="searchQuery" aria-label="Search courses" placeholder="Search anything..." @focus="activePage = 'My courses'">
            <kbd>⌘ K</kbd>
          </label>
          <button class="icon-button notification-button" aria-label="Notifications">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            <span />
          </button>
          <div class="avatar avatar-top">JD</div>
        </div>
      </header>

      <section class="page-content" aria-live="polite">
        <div v-if="announcement" class="announcement">
          <span>{{ announcement }}</span>
          <button aria-label="Dismiss message" @click="announcement = ''">×</button>
        </div>

        <template v-if="activePage === 'Overview'">
          <div class="welcome-row">
            <div>
              <div class="eyebrow"><span class="live-dot" /> YOUR CREATOR STUDIO</div>
              <h1>{{ visiblePageTitle }}<span class="wave">✳</span></h1>
              <p class="page-subtitle">Here’s what’s happening across your learning space.</p>
            </div>
            <button class="button button-primary" @click="createModalOpen = true"><span class="plus">+</span> Create a course</button>
          </div>

          <section class="pilot-banner">
            <div class="pilot-art" aria-hidden="true">
              <span class="orbit orbit-one" /><span class="orbit orbit-two" />
              <span class="art-center">e<span>.</span></span>
              <span class="art-star">✳</span>
            </div>
            <div class="pilot-copy">
              <div class="pilot-kicker">YOUR FIRST PILOT MODULE</div>
              <h2>Start with one great lesson.</h2>
              <p>Build trust with a human-reviewed pilot before you scale your whole course.</p>
            </div>
            <div class="pilot-checklist">
              <div class="checklist-progress"><span>GETTING STARTED</span><strong>2 of 4 complete</strong></div>
              <div class="progress-track"><span style="width: 50%" /></div>
              <div class="checklist-items">
                <span class="checked"><i>✓</i> Set up your workspace</span>
                <span class="checked"><i>✓</i> Add your first source</span>
                <button @click="navigate('Review queue')"><i>3</i> Review your pilot lesson <b>→</b></button>
                <button @click="openLearnerPreview"><i>4</i> Preview as a learner <b>→</b></button>
              </div>
            </div>
          </section>

          <div class="stats-grid">
            <article class="stat-card">
              <div class="stat-heading"><span>Active learners</span><span class="stat-icon stat-icon-green">↗</span></div>
              <div class="stat-value">528 <span class="trend">+12.8%</span></div>
              <div class="stat-foot">across all published courses</div>
              <div class="mini-chart chart-learners"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </article>
            <article class="stat-card">
              <div class="stat-heading"><span>Course completion</span><span class="stat-icon stat-icon-lilac">◎</span></div>
              <div class="stat-value">72<span class="value-percent">%</span> <span class="trend">+8.4%</span></div>
              <div class="stat-foot">average across your learners</div>
              <div class="mini-chart chart-completion"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </article>
            <article class="stat-card">
              <div class="stat-heading"><span>Hours given back</span><span class="stat-icon stat-icon-yellow">✳</span></div>
              <div class="stat-value">34.5 <span class="value-unit">hrs</span></div>
              <div class="stat-foot">estimated repeat support saved</div>
              <div class="stat-note"><span>↗</span> More time for your next big idea</div>
            </article>
            <article class="stat-card review-stat">
              <div class="stat-heading"><span>Needs your review</span><span class="stat-icon stat-icon-orange">!</span></div>
              <div class="stat-value">{{ reviewItems.length }} <span class="value-unit">lessons</span></div>
              <div class="stat-foot">Nothing goes live without your say.</div>
              <button class="text-action" @click="navigate('Review queue')">Open review queue <span>→</span></button>
            </article>
          </div>

          <div class="content-grid">
            <section class="panel courses-panel">
              <div class="panel-heading">
                <div><h2>Your courses</h2><p>Keep your knowledge moving.</p></div>
                <button class="link-button" @click="navigate('My courses')">All courses <span>→</span></button>
              </div>
              <div class="course-list">
                <article v-for="course in courses.slice(0, 3)" :key="course.title" class="course-row">
                  <div class="course-cover" :class="`cover-${course.color}`"><span>{{ course.initials }}</span><i>✳</i></div>
                  <div class="course-info">
                    <div class="course-title-line"><h3>{{ course.title }}</h3><span class="status-pill" :class="`status-${course.status.toLowerCase().replace(' ', '-')}`">{{ course.status }}</span></div>
                    <span class="course-meta">{{ course.lessons || 'No' }} {{ course.lessons === 1 ? 'lesson' : 'lessons' }} <span>·</span> {{ course.learners }} learners</span>
                    <div class="course-progress-line"><div class="progress-track"><span :style="{ width: `${course.completion}%` }" /></div><span>{{ course.completion ? `${course.completion}%` : '—' }}</span></div>
                  </div>
                  <button class="row-more" :aria-label="`Open ${course.title}`" @click="navigate('My courses')">···</button>
                </article>
              </div>
            </section>

            <section class="panel review-panel">
              <div class="panel-heading">
                <div><h2>Review & protect</h2><p>Your quality gates keep trust intact.</p></div>
                <span class="quality-mark">✳</span>
              </div>
              <div class="quality-summary">
                <div class="quality-ring"><span>4.8</span><small>/ 5</small></div>
                <div><strong>Quality score</strong><span>Across your published lessons</span><small class="quality-caption"><i /> All systems looking good</small></div>
              </div>
              <div class="review-alert">
                <div class="alert-icon">!</div>
                <div><strong>{{ reviewItems.length }} lessons need a human check</strong><span>Review before they reach your learners.</span></div>
                <button aria-label="Open review queue" @click="navigate('Review queue')">→</button>
              </div>
              <div class="quality-tags"><span>✓ Source-grounded</span><span>✓ AI disclosed</span><span>✓ Human-approved</span></div>
            </section>
          </div>

          <section class="panel activity-panel">
            <div class="panel-heading">
              <div><h2>Knowledge that keeps working</h2><p>When your source changes, see what it touches.</p></div>
              <button class="link-button" @click="navigate('Knowledge library')">Open knowledge library <span>→</span></button>
            </div>
            <div class="activity-content">
              <div class="source-summary">
                <div class="source-icon">▤</div>
                <div><strong>{{ sources.length }} course sources</strong><span>Only approved content can inform lessons</span></div>
              </div>
              <div class="source-impact"><span class="impact-dot" /><span><strong>Brand voice & positioning guide</strong> was updated</span><i>2 lessons to review</i></div>
              <button class="button button-secondary" @click="navigate('Knowledge library')">Manage sources</button>
            </div>
          </section>
          <footer class="page-footer"><span>Sample workspace · Illustrative data</span><span>Built for your expertise, not generic answers.</span></footer>
        </template>

        <template v-else-if="activePage === 'My courses'">
          <div class="welcome-row subpage-welcome">
            <div><div class="eyebrow">YOUR KNOWLEDGE, IN MOTION</div><h1>My courses</h1><p class="page-subtitle">Build, review and grow creator-led learning experiences.</p></div>
            <button class="button button-primary" @click="createModalOpen = true"><span class="plus">+</span> Create a course</button>
          </div>
          <div class="collection-toolbar"><span>{{ filteredCourses.length }} courses</span><button class="filter-button">☷ <span>All courses</span><i>⌄</i></button></div>
          <div v-if="filteredCourses.length" class="course-grid">
            <article v-for="course in filteredCourses" :key="course.title" class="course-card">
              <button class="course-card-art-button" :aria-label="`Preview ${course.title} as a learner`" @click="openLearnerPreview">
                <div class="course-card-art" :class="`cover-${course.color}`"><span class="cover-big-letter">{{ course.initials.slice(0, 1) }}</span><span class="cover-orb" /><span class="cover-label">THE GROWTH STUDIO</span><span class="cover-title">{{ course.title }}</span><i>✳</i><span class="preview-label">Preview course →</span></div>
              </button>
              <div class="course-card-body">
                <div class="course-title-line"><span class="status-pill" :class="`status-${course.status.toLowerCase().replace(' ', '-')}`">{{ course.status }}</span><button class="row-more" aria-label="Course options">···</button></div>
                <h3>{{ course.title }}</h3><span class="course-category">{{ course.category }}</span>
                <div class="course-card-stats"><span>{{ course.lessons }} lessons</span><span>{{ course.learners }} learners</span></div>
                <div class="course-progress-line"><div class="progress-track"><span :style="{ width: `${course.completion}%` }" /></div><span>{{ course.completion ? `${course.completion}% complete` : 'Not published' }}</span></div>
              </div>
            </article>
            <button class="new-course-card" @click="createModalOpen = true"><span>+</span><strong>Create your next course</strong><small>Start with what you already know.</small></button>
          </div>
          <div v-else class="empty-state"><span>⌕</span><h2>No courses found</h2><p>Try another search or start a new course.</p><button class="button button-secondary" @click="searchQuery = ''">Clear search</button></div>
          <div class="page-note"><span>✳</span><span><strong>Your voice stays yours.</strong> Courses are built from your approved sources, reviewed by your team, and clearly disclosed to every learner.</span></div>
        </template>

        <template v-else-if="activePage === 'Knowledge library'">
          <div class="welcome-row subpage-welcome">
            <div><div class="eyebrow">THE SOURCE OF YOUR TEACHING</div><h1>Knowledge library</h1><p class="page-subtitle">Your approved content is the foundation for every lesson and answer.</p></div>
            <label class="button button-primary upload-button"><span class="plus">+</span> Add a source<input type="file" multiple accept=".pdf,.doc,.docx,.txt,.mp4,.mov,.mp3,.wav" @change="handleFiles"></label>
          </div>
          <div class="privacy-banner"><span class="privacy-icon">◈</span><div><strong>Your content. Your control.</strong><p>Only content you approve can inform lessons. Your private materials are never used to train shared AI models.</p></div><span class="privacy-check">✓ Protected</span></div>
          <section class="panel library-panel">
            <div class="library-toolbar"><div><h2>Course sources</h2><span>{{ sources.length }} sources · only approved content informs lessons</span></div><button class="filter-button">↕ <span>Recently updated</span><i>⌄</i></button></div>
            <div class="source-table">
              <div class="source-table-head"><span>NAME</span><span>TYPE</span><span>LAST UPDATED</span><span>LESSONS USING SOURCE</span><span /></div>
              <article v-for="source in sources" :key="source.name" class="source-table-row">
                <div class="source-name"><span class="file-icon" :class="{ 'file-video': source.kind.startsWith('Video') }">{{ source.kind.startsWith('Video') ? '▶' : source.kind.startsWith('PDF') ? 'PDF' : '▤' }}</span><strong>{{ source.name }}</strong></div>
                <span class="source-type">{{ source.kind }}</span><span class="source-updated">{{ source.updated }}</span><span class="source-lessons"><b>{{ source.lessons }}</b> lessons <span v-if="source.lessons" class="tiny-link">View impact</span></span>
                <button class="row-more" aria-label="Source options">···</button>
              </article>
            </div>
            <label class="drop-zone" :class="{ 'drop-zone-active': dragActive }" @dragover.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @drop.prevent="handleDrop"><span class="drop-icon">↑</span><strong>Drop a file to add to your library</strong><small>PDF, video, audio or text · Add existing expertise, not more busywork.</small><span class="drop-browse">Choose files<input type="file" multiple accept=".pdf,.doc,.docx,.txt,.mp4,.mov,.mp3,.wav" @change="handleFiles"></span></label>
          </section>
          <div class="page-note"><span>↗</span><span><strong>Update a source, not a recording.</strong> When you update approved material, Evolv maps the change to affected lessons so your team can review what matters.</span></div>
        </template>

        <template v-else-if="activePage === 'Review queue'">
          <div class="welcome-row subpage-welcome">
            <div><div class="eyebrow">HUMAN-IN-THE-LOOP QUALITY</div><h1>Review queue</h1><p class="page-subtitle">Your team has the final say. Nothing goes live without approval.</p></div>
            <span class="queue-count"><strong>{{ reviewItems.length }}</strong> awaiting review</span>
          </div>
          <div class="review-principles"><div><span>01</span><strong>Grounded in your sources</strong><small>Every lesson is checked against approved knowledge.</small></div><div><span>02</span><strong>True to your methodology</strong><small>Keep your teaching approach and boundaries intact.</small></div><div><span>03</span><strong>Clear to every learner</strong><small>AI is disclosed. A real person is always reachable.</small></div></div>
          <section v-if="reviewItems.length" class="review-queue-list">
            <article v-for="(item, index) in reviewItems" :key="item.title" class="panel review-item">
              <div class="review-item-top"><div class="review-course-icon" :class="`cover-${item.color}`">{{ item.initials }}</div><div class="review-title"><span>LESSON · {{ item.course }}</span><h2>{{ item.title }}</h2><p>{{ item.detail }}</p></div><span class="status-pill status-in-review">Needs review</span></div>
              <div class="gate-list"><span class="gate-passed"><i>✓</i> Source-grounded</span><span class="gate-passed"><i>✓</i> Methodology matched</span><span class="gate-pending"><i>!</i> Human sign-off</span><span class="gate-passed"><i>✓</i> AI disclosure included</span></div>
              <div class="review-item-actions"><button class="button button-secondary" @click="requestChanges(index)">Request changes</button><button class="button button-primary" @click="approveReview(index)">Approve for learners <span>→</span></button></div>
            </article>
          </section>
          <div v-else class="empty-state"><span class="empty-check">✓</span><h2>You’re all caught up</h2><p>Every lesson in your queue has been reviewed.</p><button class="button button-secondary" @click="navigate('Overview')">Back to overview</button></div>
        </template>

        <template v-else>
          <div class="welcome-row subpage-welcome">
            <div><div class="eyebrow">PEOPLE LEARNING FROM YOU</div><h1>Learners</h1><p class="page-subtitle">Spot progress, celebrate momentum and make human support easy to reach.</p></div>
            <button class="button button-secondary">Export learners <span>↓</span></button>
          </div>
          <div class="stats-grid learner-stats"><article class="stat-card"><div class="stat-heading"><span>Total learners</span><span class="stat-icon stat-icon-green">↗</span></div><div class="stat-value">528 <span class="trend">+12.8%</span></div><div class="stat-foot">across your published courses</div></article><article class="stat-card"><div class="stat-heading"><span>Learning this week</span><span class="stat-icon stat-icon-lilac">◷</span></div><div class="stat-value">164</div><div class="stat-foot">learners active in the last 7 days</div></article><article class="stat-card"><div class="stat-heading"><span>Human support</span><span class="stat-icon stat-icon-orange">♡</span></div><div class="stat-value">2 <span class="value-unit">learners</span></div><div class="stat-foot">could use a personal check-in</div></article></div>
          <section class="panel learner-panel"><div class="library-toolbar"><div><h2>Your learners</h2><span>Progress signals help you support people—not just measure them.</span></div><button class="filter-button">☷ <span>All courses</span><i>⌄</i></button></div><div class="learner-table"><div class="learner-table-head"><span>LEARNER</span><span>COURSE</span><span>PROGRESS</span><span>LAST ACTIVE</span><span>SUPPORT</span></div><article v-for="learner in learners" :key="learner.email" class="learner-table-row"><div class="learner-person"><span class="avatar" :class="`avatar-${learner.color}`">{{ learner.initials }}</span><div><strong>{{ learner.name }}</strong><small>{{ learner.email }}</small></div></div><span class="learner-course">{{ learner.course }}</span><div class="learner-progress"><span>{{ learner.progress }}%</span><div class="progress-track"><span :style="{ width: `${learner.progress}%` }" /></div></div><span class="learner-activity">{{ learner.activity }}</span><span class="support-status" :class="{ 'support-needed': learner.needsHelp }"><i />{{ learner.needsHelp ? 'Check in' : 'On track' }}</span></article></div></section>
          <div class="page-note"><span>♡</span><span><strong>Sample learner data · AI support is not the only support.</strong> Learners can ask for a real person when they need more than a lesson or an answer.</span></div>
        </template>
      </section>
    </main>

    <div v-if="createModalOpen" class="modal-backdrop" @click.self="createModalOpen = false">
      <form class="create-modal" @submit.prevent="createCourse">
        <button type="button" class="modal-close" aria-label="Close dialog" @click="createModalOpen = false">×</button>
        <span class="modal-spark">✳</span><div class="eyebrow">START WITH WHAT YOU KNOW</div>
        <h2>Create a course</h2><p>Begin with a working title. You can add approved sources and map lessons next.</p>
        <label class="field-label" for="course-title">Course title</label><input id="course-title" v-model="newCourseTitle" class="text-field" autofocus placeholder="e.g. The Confident Consultant">
        <label class="field-label" for="course-category">Area of expertise</label><select id="course-category" v-model="newCourseCategory" class="text-field"><option>Creator business</option><option>Brand strategy</option><option>Course creation</option><option>Leadership & growth</option><option>Other</option></select>
        <div class="modal-hint"><span>◈</span> Your course starts as a private draft. Nothing is published automatically.</div>
        <button type="submit" class="button button-primary modal-submit" :disabled="!newCourseTitle.trim()">Create draft <span>→</span></button>
      </form>
    </div>
    <div v-if="learnerPreviewOpen" class="modal-backdrop learner-preview-backdrop" @click.self="learnerPreviewOpen = false">
      <section class="learner-preview">
        <header class="preview-header"><a class="brand preview-brand" href="#" @click.prevent><span class="brand-mark"><span /></span><span class="brand-name">evolv<span class="brand-period">.</span></span></a><span class="preview-disclosure"><i /> AI-assisted lesson · Built from Jordan’s approved sources</span><button class="modal-close" aria-label="Close learner preview" @click="learnerPreviewOpen = false">×</button></header>
        <div class="preview-layout">
          <aside class="preview-outline"><span class="preview-overline">THE CREATOR GROWTH SYSTEM</span><h2>Your learning path</h2><div class="outline-progress"><div class="progress-track"><span :style="{ width: learnerLessonCompleted ? '50%' : '38%' }" /></div><span>{{ learnerLessonCompleted ? '4 of 8' : '3 of 8' }} lessons</span></div><div class="outline-section"><strong>01 · Find your foundation</strong><span class="outline-done">✓ Your point of view</span><span :class="learnerLessonCompleted ? 'outline-done' : 'outline-current'">{{ learnerLessonCompleted ? '✓' : '●' }} Find your point of difference</span><span :class="learnerLessonCompleted ? 'outline-current' : 'outline-locked'">{{ learnerLessonCompleted ? '●' : '○' }} Know your audience</span></div><div class="outline-section"><strong>02 · Build your system</strong><span class="outline-locked">○ Make your method repeatable</span></div><div class="preview-human-help"><span>♡</span><strong>Want a real person?</strong><small>Your creator’s team is here when you need them.</small><button :disabled="humanHelpRequested" @click="humanHelpRequested = true">{{ humanHelpRequested ? 'Request noted in this preview ✓' : 'Ask for human help →' }}</button></div></aside>
          <div class="preview-lesson"><div class="lesson-breadcrumb">Lesson 3 <span>/</span> Find your point of difference</div><div class="lesson-disclosure">✳ &nbsp; Jordan’s AI teaching assistant · grounded in approved course materials</div><h2>Make your difference unmistakable.</h2><p class="lesson-intro">Your point of difference isn’t a clever tagline. It’s the specific way you see a problem—and help someone move through it.</p><div class="creator-quote"><span>FROM JORDAN’S FRAMEWORK</span><p>“Don’t ask what makes you different. Ask what your clients say they <em>couldn’t get anywhere else</em>.”</p><small>Source: The Growth Framework workshop · 18:42</small></div><div v-if="learnerExplanation === 'simple'" class="lesson-body"><h3>Start with the moments that stick.</h3><p>Look back at three clients who made real progress. What did they arrive believing? What changed after working with you? The pattern between those moments is where your method lives.</p></div><div v-else class="lesson-body example-explanation"><h3>Think of it like a signature recipe.</h3><p>Lots of people can bake a cake. Your difference is the unexpected ingredient and the order you use it in. Write down what your clients tried before you, then name the one step in your approach that changed their result.</p></div><div class="lesson-actions"><span>Would another explanation help?</span><button :class="{ selected: learnerExplanation === 'simple' }" @click="learnerExplanation = 'simple'">Simpler</button><button :class="{ selected: learnerExplanation === 'example' }" @click="learnerExplanation = 'example'">Give me an example</button></div><div class="confidence-check"><strong>How confident do you feel about finding your difference?</strong><div><button v-for="(label, index) in ['Not yet', 'Getting there', 'I’ve got it']" :key="label" :class="{ selected: learnerConfidence === index }" @click="learnerConfidence = index">{{ label }}</button></div><p v-if="learnerConfidence !== null">{{ learnerConfidence === 2 ? 'Great work. Your next lesson is ready when you are.' : 'Thanks for letting Jordan’s teaching assistant know. You can revisit this lesson or ask a real person for help.' }}</p></div><div class="preview-next"><button class="button button-secondary" @click="learnerExplanation = learnerExplanation === 'simple' ? 'example' : 'simple'">↻ Try another explanation</button><button class="button button-primary" :disabled="learnerLessonCompleted" @click="completeLearnerLesson">{{ learnerLessonCompleted ? 'Lesson completed ✓' : 'Mark lesson complete →' }}</button></div></div>
        </div>
      </section>
    </div>
  </div>
</template>
