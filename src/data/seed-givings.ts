/**
 * 种子 Giving 数据 (40 条)
 *
 * 分类:
 * - 10 职业/简历 (career)
 * - 8 情绪/平静 (emotional)
 * - 8 开发/学习 (dev)
 * - 6 沟通 (communication)
 * - 4 生活/管理 (life)
 * - 4 食物/创意 (creative)
 *
 * 中英文各半。每条 ≤ 280 字符，具体可操作。
 */

export const seedGivings: { content: string; language: 'en' | 'zh' }[] = [
  // === Career (10) ===
  {
    content: '改简历时，把一句"负责某事"改成"做了什么 + 数字 + 结果"。',
    language: 'zh',
  },
  {
    content: 'Before an interview, record yourself answering one question. Listen back and cut 30% of your words.',
    language: 'en',
  },
  {
    content: '面试最后对方问"你有什么想问的"，问一句"这个岗位做得好和做得特别好的人，半年后最大的区别是什么"。',
    language: 'zh',
  },
  {
    content: 'Before a meeting, write one sentence on the agenda about what decision you need. If there is no decision needed, ask if the meeting can be an email.',
    language: 'en',
  },
  {
    content: '工资谈判前，先查三个数据：同行业同城市同级别的薪资中位数、你过去一年带来的可量化成果、你下一年的具体目标。',
    language: 'zh',
  },
  {
    content: 'Your LinkedIn headline should say what you do, who you help, and one result. Not your job title.',
    language: 'en',
  },
  {
    content: '发给领导的汇报邮件，第一句写结论，第二句写影响，第三句写下一步。正文超过五行就加一个小标题。',
    language: 'zh',
  },
  {
    content: 'If a task takes less than two minutes, do it now instead of putting it on a list.',
    language: 'en',
  },
  {
    content: '改PPT时，每页只留一个核心信息。如果观众十秒内说不出这页的重点，删掉多余内容。',
    language: 'zh',
  },
  {
    content: 'Before sending a work email, read it once from the recipient\'s perspective. Cut anything they don\'t need to know right now.',
    language: 'en',
  },

  // === Emotional/Calm (8) ===
  {
    content: '如果事情太多，先写下一个小到两分钟能完成的动作。',
    language: 'zh',
  },
  {
    content: 'When you\'re overwhelmed, name one thing you can see, one you can hear, and one you can touch. It takes ten seconds.',
    language: 'en',
  },
  {
    content: '心烦时不要做重大决定。先睡一觉，第二天早上再想，答案通常会变。',
    language: 'zh',
  },
  {
    content: 'Write down three things that went well today, no matter how small. Do it for a week before judging whether it helps.',
    language: 'en',
  },
  {
    content: '如果焦虑一个还没发生的事，拿一张纸分两栏：左边写你能控制的，右边写你不能控制的。只看左边。',
    language: 'zh',
  },
  {
    content: 'Set a 15-minute timer to worry. When the timer ends, you are done worrying for the day. If the thought comes back, tell it to wait for tomorrow\'s 15 minutes.',
    language: 'en',
  },
  {
    content: '对自己说一句话时，用"你现在感到..."而不是"你总是..."。用描述代替标签。',
    language: 'zh',
  },
  {
    content: 'When you catch yourself comparing to someone else, finish this sentence: "One thing I have that I didn\'t earn is..." Gratitude outruns comparison.',
    language: 'en',
  },

  // === Dev/Study (8) ===
  {
    content: 'Before debugging, write what you expected, what happened, and the smallest test you can run next.',
    language: 'en',
  },
  {
    content: '学新工具时，先做一个最小的能跑的东西，再回头补原理。不要从文档第一页开始读。',
    language: 'zh',
  },
  {
    content: 'When reading docs, search for the "Limitations" or "Caveats" section first. That\'s where the real constraints are.',
    language: 'en',
  },
  {
    content: 'Code review 时，先看测试用例再看实现。测试告诉你作者认为这段代码应该干什么。',
    language: 'zh',
  },
  {
    content: '遇到报错信息，先完整读一遍再搜。大多数时候答案就在报错里，你只是跳过了那行英文。',
    language: 'zh',
  },
  {
    content: 'Commit messages should answer: what changed, why, and what trade-off was made. "Fixed bug" is not a commit message.',
    language: 'en',
  },
  {
    content: 'Every time you solve a non-trivial bug, add a one-sentence note to a personal "debug log". In six months you will have your own troubleshooting playbook.',
    language: 'en',
  },
  {
    content: '写代码超过一小时后还没跑通，站起来离开屏幕五分钟。回来时先描述问题给一个不会编程的朋友听。',
    language: 'zh',
  },

  // === Communication (6) ===
  {
    content: 'Before giving feedback, write one sentence about what worked before naming what confused you.',
    language: 'en',
  },
  {
    content: '给同事提建议时，用"我注意到...我的理解是..."开头，不用"你应该..."。',
    language: 'zh',
  },
  {
    content: 'When someone disagrees with you, say "Help me understand your perspective" before arguing your point.',
    language: 'en',
  },
  {
    content: '拒绝别人时，先说"我不能"而不是"我不想"。前者是边界，后者是态度，听感完全不同。',
    language: 'zh',
  },
  {
    content: 'If a conversation is going in circles, say "Let me say back what I heard to make sure I understand" and summarize their point in one sentence.',
    language: 'en',
  },
  {
    content: '在群里发消息前，问自己：这条信息是通知、讨论、还是决策？标题里标清楚，收消息的人会感谢你。',
    language: 'zh',
  },

  // === Life/Admin (4) ===
  {
    content: '收到发票或合同，立刻拍照或扫描存到一个固定文件夹。不要"等会儿再弄"。',
    language: 'zh',
  },
  {
    content: 'Keep a "when I\'m gone" note: where your documents are, what subscriptions to cancel, who to call. Update it once a year.',
    language: 'en',
  },
  {
    content: '租房签合同前，拍下每个房间的细节照片，特别是已有的破损。入住当天发给房东确认。',
    language: 'zh',
  },
  {
    content: 'Every subscription you start, set a calendar reminder one week before the free trial ends. Cancel immediately if you would not pay full price.',
    language: 'en',
  },

  // === Food/Creative (4) ===
  {
    content: '炒青菜不出水的关键：锅要够热，油要够热，菜下锅后不要频繁翻动。等一面微焦再翻。',
    language: 'zh',
  },
  {
    content: 'When you have writer\'s block, write the worst version first. Set a timer for five minutes and write something intentionally bad. You cannot edit a blank page.',
    language: 'en',
  },
  {
    content: '煮面条的水里加一小勺盐和几滴油。面不粘连，口感更弹。',
    language: 'zh',
  },
  {
    content: 'If a recipe says "cook until done," it means "cook until it looks and smells like food you want to eat." Trust your senses more than the timer.',
    language: 'en',
  },
];
