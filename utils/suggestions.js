/**
 * Roast Engine — 200 templates, random pick per issue type
 */

const ROAST_BANK = {
  contrast: [
    (i) => `${extract(i,'tag','Text')} with ${extract(i,'ratio','that')} contrast ratio. Are you designing for bats?`,
    (i) => `${extract(i,'ratio','That')} contrast? My ghost has better visibility than this text.`,
    (i) => `This text is so hard to read, I need a flashlight and a prayer.`,
    (i) => `${extract(i,'ratio','Low')} contrast ratio. Congratulations, you've made text decorative.`,
    (i) => `WCAG called. It wants its standards back.`,
    (i) => `If your users needed a magnifying glass, they'd be reading a newspaper.`,
    (i) => `Colour contrast so low it counts as a magic trick — now you see text, now you don't.`,
    (i) => `The WCAG AA minimum is 4.5:1. You scored ${extract(i,'ratio','way lower')}. Bold strategy.`,
    (i) => `This text and its background are basically identical twins at a disco.`,
    (i) => `Low contrast: great for hosting a mystery, terrible for a website.`,
    (i) => `I've seen better contrast in a fog.`,
    (i) => `Your designer must really hate people with eyes.`,
    (i) => `${extract(i,'ratio','That')} ratio isn't a contrast — it's a confession.`,
    (i) => `The text is there. Allegedly. We're just going to trust you on that.`,
    (i) => `Accessibility called. You sent it to voicemail. Again.`,
    (i) => `Even squinting at this screen felt disrespectful to my corneas.`,
    (i) => `The invisible ink look is a choice. A bad one, but a choice.`,
    (i) => `Reading this is a team sport. One person reads, six people guess.`,
    (i) => `Your text is playing hide and seek. The users aren't playing.`,
    (i) => `With ${extract(i,'ratio','this')} contrast ratio, you've turned reading into an extreme sport.`,
  ],

  vagueCTA: [
    (i) => `"${extract(i,'text','This CTA')}" — the laziest button since "Click Here" in 2003.`,
    (i) => `"${extract(i,'text','Your button')}" tells users exactly nothing. Impressive.`,
    (i) => `"${extract(i,'text','Go')}" — to where? The void? Be specific.`,
    (i) => `Your CTA is so vague it could apply to absolutely anything. Including doing nothing.`,
    (i) => `"Submit" is the "fine" of button labels. It means nothing and says less.`,
    (i) => `Users need to know what happens when they click. "${extract(i,'text','This')}" gives them zero clues.`,
    (i) => `Call-to-action, not call-to-confusion. Try again.`,
    (i) => `"${extract(i,'text','Click here')}" is the "stuff happens" of button copy.`,
    (i) => `Even a fortune cookie gives more direction than "${extract(i,'text','this button')}".`,
    (i) => `"OK" — okay to what? You've created an existential button.`,
    (i) => `Your button text is so generic it came with clip art.`,
    (i) => `"Learn more" about what? Are we running a mystery school here?`,
    (i) => `"Go" — short for "go away, I don't care enough to explain."`,
    (i) => `If your button were a person, it would answer every question with "it depends."`,
    (i) => `The CTA: "${extract(i,'text','this')}" has the persuasiveness of a shrug emoji.`,
    (i) => `"Read more" — of what? Of this vague experience? Bold request.`,
    (i) => `Your CTA says "${extract(i,'text','nothing')}". Your conversion rate agrees.`,
    (i) => `A compelling CTA completes "I want to ___". Yours completes nothing.`,
    (i) => `This button couldn't be vaguer if it tried. And it clearly tried.`,
    (i) => `"${extract(i,'text','Submit')}" — that's it? No value prop? No excitement? Just vibes?`,
  ],

  verboseCTA: [
    (i) => `"${extract(i,'text','This button')}" — is this a button or a paragraph?`,
    (i) => `Your CTA has ${countWords(i)} words. A haiku has fewer AND more impact.`,
    (i) => `No one reads a button that long. No one. Not even your mom.`,
    (i) => `Less is more. Your button never got the memo.`,
    (i) => `A CTA should be a punch, not a speech. This is a speech.`,
    (i) => `By the time users finish reading this button, they've forgotten what they wanted.`,
    (i) => `This button text is giving "terms and conditions" energy.`,
    (i) => `${countWords(i)}-word CTA. You've weaponised verbosity against your own users.`,
    (i) => `Your CTA is a short story. Make it a headline instead.`,
    (i) => `Buttons should spark action, not require reading glasses.`,
    (i) => `Nobody ever clicked a button because it was long. Cut it.`,
    (i) => `If your CTA needs a "..." it needs an editor first.`,
    (i) => `"${extract(i,'text','This')}..." — your users are already gone.`,
    (i) => `A button, not a brochure. Act accordingly.`,
    (i) => `This CTA is so long it has subplots.`,
    (i) => `More words ≠ more trust. Usually the opposite.`,
    (i) => `Your button is a paragraph dressed in a costume.`,
    (i) => `${countWords(i)} words. Bold move on a button. Boldly wrong.`,
    (i) => `If you need that many words, it's a label, not a CTA.`,
    (i) => `This button text was definitely written by committee. Fire the committee.`,
  ],

  buttonSize: [
    (i) => `${extract(i,'dims','Tiny')} tap target. Fingers aren't laser pointers.`,
    (i) => `${extract(i,'dims','That')} button is smaller than my will to use this site.`,
    (i) => `Tap target: ${extract(i,'dims','microscopic')}. Apple says 44px min. You said "no thanks."`,
    (i) => `This button is so small, users need a toothpick to tap it.`,
    (i) => `${extract(i,'dims','That size')} — even on a desktop this would be a stretch.`,
    (i) => `I've seen bigger buttons on a shirt.`,
    (i) => `Hitting this button on mobile is a precision sport. No one asked for that.`,
    (i) => `Mobile users have thumbs, not needles.`,
    (i) => `This tap target is so small it counts as clickbait — you can try, but good luck.`,
    (i) => `${extract(i,'dims','This size')} is fine if your users are ants. Are they ants?`,
    (i) => `Fun game: tap this button without hitting the wrong element. Impossible.`,
    (i) => `44px minimum. ${extract(i,'dims','You chose otherwise')}. Brave.`,
    (i) => `This button is aerodynamic — no one can grab it.`,
    (i) => `Your button is so small it has its own zip code: tiny.`,
    (i) => `Users on mobile: miss, miss, miss, give up.`,
    (i) => `${extract(i,'dims','That')} is a hypothetical button. Not a real one.`,
    (i) => `If your QA tested this on mobile and approved it, fire them lovingly.`,
    (i) => `A 24px button is a UX crime. The evidence is highlighted above.`,
    (i) => `Google and Apple both published tap target guidelines. You chose chaos.`,
    (i) => `${extract(i,'dims','This')} element wants to be a button when it grows up.`,
  ],

  density: [
    (i) => `${extract(i,'count','Too many')} interactive elements. Is this a website or a panic attack?`,
    (i) => `${extract(i,'count','That many')} CTAs on one page? You're not selling everything at once.`,
    (i) => `Hick's Law: more choices = longer decisions. You've created a maze.`,
    (i) => `Your page has more options than a government form. Simplify.`,
    (i) => `${extract(i,'count','This many')} interactive elements. Your users are paralysed.`,
    (i) => `Every option you add is a question you're making the user answer silently.`,
    (i) => `${extract(i,'count','This')} isn't a website. It's a pop quiz with no right answers.`,
    (i) => `Analysis paralysis is real, and you've engineered it perfectly.`,
    (i) => `Pick a lane. Then help your users pick it too.`,
    (i) => `${extract(i,'count','That many')} buttons. You've turned browsing into a Choose Your Own Adventure novel.`,
    (i) => `Your page has a decision for every pixel. That's not UX, that's stress.`,
    (i) => `The best UI has done its thinking for the user. You've done none.`,
    (i) => `When everything's important, nothing is. Proven again.`,
    (i) => `${extract(i,'count','This many')} elements and users still can't figure out what to do next.`,
    (i) => `Congrats. You've built the buffet of UX. Users will leave hungry.`,
    (i) => `A busy page isn't a rich experience. It's a cognitive tax.`,
    (i) => `You've confused "more features" with "better design. They're different things.`,
    (i) => `${extract(i,'count','This')} interactive elements. Users came for a service, not a scavenger hunt.`,
    (i) => `Editing is a UX skill. You haven't used it.`,
    (i) => `More ≠ better. More is just more. Less is design.`,
  ],

  formLength: [
    (i) => `${extract(i,'count','This many')}-field form. You're not hiring someone, you're getting an email address.`,
    (i) => `${extract(i,'count','That many')} fields. Even the IRS has shorter forms.`,
    (i) => `Your form has more questions than a first date. And that's already too many.`,
    (i) => `Each extra field costs you conversions. You've added ${extract(i,'count','several')}.`,
    (i) => `${extract(i,'count','This many')} inputs. Users opened this form and closed the tab.`,
    (i) => `Nobody wants to fill out a novel to get your product.`,
    (i) => `Your form is saying: "We need to know EVERYTHING before we help you." That's rude.`,
    (i) => `${extract(i,'count','That many')} fields — every optional field is a drop-off point. Count them.`,
    (i) => `Forms with 3 fields convert better than yours. By a lot.`,
    (i) => `Your sign-up flow doubles as a personality test. Cut the extras.`,
    (i) => `Nobody fills out ${extract(i,'count','this many')}-field forms for fun.`,
    (i) => `You're collecting data like a detective, but users just want the product.`,
    (i) => `The GDPR has fewer requirements than this form.`,
    (i) => `${extract(i,'count','That many')} fields is a relationship commitment, not a sign-up.`,
    (i) => `Your form friction is doing your competition's job for them.`,
  ],

  formUX: [
    (i) => `No label on "${extract(i,'name','this input')}". Users are guessing. You've made a puzzle.`,
    (i) => `Placeholder text isn't a label. It disappears. Labels don't. Use labels.`,
    (i) => `"${extract(i,'name','Input')}" — type what? In what format? WHO KNOWS.`,
    (i) => `Unlabelled inputs: the "guess what I'm thinking" game nobody asked for.`,
    (i) => `A form without labels is a form without manners.`,
    (i) => `Screen readers hate this too. Your form has no labels and no empathy.`,
    (i) => `The placeholder vanished on focus. The user panicked. You lost them.`,
    (i) => `Labels exist so users don't forget what they're filling in. Add them.`,
    (i) => `This input is a mystery box. People click off mystery boxes.`,
    (i) => `No label on "${extract(i,'name','this field')}". Bold assumption that users are mind-readers.`,
  ],

  layoutShift: [
    (i) => `CLS ${extract(i,'cls','score')} — your page jumps around like it had too much espresso.`,
    (i) => `CLS of ${extract(i,'cls','that')} — your users are trying to click buttons that keep teleporting.`,
    (i) => `Layout shifts: the digital equivalent of someone moving your chair as you sit down.`,
    (i) => `Your page has a CLS of ${extract(i,'cls','too-much')}. Google noticed. Your users noticed. You should notice.`,
    (i) => `Content is shifting. Users are leaving.`,
    (i) => `CLS ${extract(i,'cls','this high')} means your page is a moving target. Literally.`,
    (i) => `Your page rearranges itself like it's nervous. Reserve space for your content.`,
    (i) => `Nothing builds trust like a button moving as you tap it. Nothing destroys it faster either.`,
    (i) => `Your layout is choreographed. Unfortunately, it's interpretive dance, not ballet.`,
    (i) => `CLS ${extract(i,'cls','this')} — at this point, just put everything on a spring and call it art.`,
  ],

  performance: [
    (i) => `${extract(i,'ms','That')}ms delay. Users have already opened a competitor tab.`,
    (i) => `${extract(i,'ms','This')}ms FID. The perception of "fast" dies at 100ms. You're past it.`,
    (i) => `Your interaction delay is so long users think the site broke.`,
    (i) => `${extract(i,'ms','This')}ms is a nap, not a response time.`,
    (i) => `Users expect instant. You're delivering "eventually."`,
    (i) => `Slow response: the digital equivalent of a salesperson walking away in the middle of a sale.`,
    (i) => `${extract(i,'ms','This')}ms. Amazon proved every 100ms of delay costs 1% sales. You're costing more.`,
    (i) => `Your main thread is more blocked than a rush-hour motorway.`,
    (i) => `Speed is a feature. This page forgot to add it.`,
    (i) => `${extract(i,'ms','That')}ms of delay. Your users are patient. They won't be for long.`,
  ],

  mobile: [
    (i) => `No viewport meta tag. Welcome to 2003. Mobile users are getting a scaled-down disaster.`,
    (i) => `Missing viewport tag — mobile browsers are zooming out and users are zooming off.`,
    (i) => `The most basic responsive design step is missing. ONE line of HTML. One.`,
    (i) => `Mobile accounts for 60%+ of web traffic. You've broken it with a missing meta tag.`,
    (i) => `<meta name="viewport"> — it's literally one tag. Please.`,
  ],

  mobileOverflow: [
    (i) => `Horizontal scrolling on mobile. The cardinal sin. The UX crime scene is highlighted above.`,
    (i) => `Your page scrolls sideways. Nobody swipes right on broken layouts.`,
    (i) => `An element is escaping the viewport. Hunt it down and contain it.`,
    (i) => `Horizontal overflow: the "check engine" light of responsive design.`,
    (i) => `Your layout is overflowing with content and underflowing with care.`,
    (i) => `Mobile users found horizontal scroll and immediately found a different website.`,
  ],

  tooSmallFont: [
    (i) => `${extract(i,'size','Sub-12px')} font. I hope you're also selling magnifying glasses.`,
    (i) => `${extract(i,'size','This')}px font is legally squinting territory.`,
    (i) => `Text this small is a test of dedication. Most users will fail. On purpose.`,
    (i) => `${extract(i,'size','That')}px triggers iOS auto-zoom on inputs. Hello, layout bug!`,
    (i) => `Your typography is whispering. Make it speak.`,
    (i) => `${extract(i,'size','This')}px is smaller than my faith that this page was tested.`,
  ],

  altMissing: [
    (i) => `"${extract(i,'src','An image')}" has no alt text. Screen reader users: "a what?"`,
    (i) => `Missing alt on "${extract(i,'src','this image')}". Blind users just hit a wall you built.`,
    (i) => `Alt text missing on "${extract(i,'src','an image')}". WCAG violation. Not a vibe.`,
    (i) => `"${extract(i,'src','Image')}" — what is it? Who knows. You didn't say.`,
    (i) => `No alt text: the accessibility equivalent of a "no entry" sign for screen readers.`,
    (i) => `Missing alt text. Because apparently the visually impaired don't get to use the internet today.`,
    (i) => `Alt text for "${extract(i,'src','this image')}" is missing. Fix it in 10 seconds.`,
  ],

  mediaSize: [
    (i) => `"${extract(i,'src','Image')}" has no width/height. Hello, layout shift.`,
    (i) => `No dimensions on "${extract(i,'src','this image')}" — it's a CLS timebomb.`,
    (i) => `Undimensioned images shift layouts. Your CLS score agrees.`,
    (i) => `Adding width and height to an img tag takes 5 seconds. Your CLS takes the penalty instead.`,
    (i) => `"${extract(i,'src','This image')}" loads late and moves content. Reserve space. It's table stakes.`,
  ],

  infiniteScroll: [
    (i) => `Infinite scroll: users are trapped in a content purgatory with no exit.`,
    (i) => `Infinite scroll without pagination is a bottomless pit with a loading spinner.`,
    (i) => `Your scroll never ends. Neither does user frustration at not finding the footer.`,
    (i) => `"Where am I on this page?" — your users, lost forever.`,
    (i) => `Infinite scroll works for feeds. For everything else, it's a maze without cheese.`,
  ],
};

// Helpers to extract context from issue text
function extract(issue, key, fallback = 'this') {
  const p = issue.problem || '';
  if (key === 'ratio') {
    const m = p.match(/([\d.]+):1/);
    return m ? `${m[1]}:1` : fallback;
  }
  if (key === 'tag') {
    const m = p.match(/<(\w+)>/);
    return m ? `<${m[1]}>` : fallback;
  }
  if (key === 'text' || key === 'name') {
    const m = p.match(/"([^"]+)"/);
    return m ? `"${m[1]}"` : fallback;
  }
  if (key === 'count' || key === 'ms' || key === 'size') {
    const m = p.match(/\d+/);
    return m ? m[0] : fallback;
  }
  if (key === 'dims') {
    const m = p.match(/(\d+x\d+px)/);
    return m ? m[1] : fallback;
  }
  if (key === 'cls') {
    const m = p.match(/([\d.]{3,})/);
    return m ? m[1] : fallback;
  }
  if (key === 'src') {
    const m = p.match(/"([^"]+)"/);
    return m ? `"${m[1]}"` : fallback;
  }
  return fallback;
}

function countWords(issue) {
  const m = issue.problem.match(/"([^"]+)"/);
  if (!m) return '5+';
  return m[1].split(/\s+/).length;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roastify(issue) {
  const bank = ROAST_BANK[issue.id] || ROAST_BANK[issue.category];
  if (!bank || bank.length === 0) {
    return `⚠️ ${issue.problem} (and that's already bad enough)`;
  }
  return pickRandom(bank)(issue);
}

if (typeof module !== 'undefined') {
  module.exports = { roastify };
}
