// 空间和风格分类数据
// 修改此文件即可更新全站分类

export interface Category {
  slug: string;
  label: string;
  description: string;
}

export const spaces: Category[] = [
  { slug: 'whole-house', label: '全屋案例', description: '完整住宅设计，呈现整体空间关系' },
  { slug: 'living-room', label: '客厅', description: '家的核心交流区，待客与日常' },
  { slug: 'bedroom', label: '卧室', description: '私密休憩空间，舒适与美学的平衡' },
  { slug: 'kitchen-dining', label: '厨餐厅', description: '烟火气与仪式感并存的空间' },
  { slug: 'bathroom', label: '卫生间', description: '小而精致的功能美学' },
  { slug: 'study', label: '书房', description: '专注与灵感的容器' },
  { slug: 'entrance', label: '玄关', description: '入门第一眼，空间的序章' },
  { slug: 'balcony', label: '阳台', description: '室内与室外的过渡地带' },
  { slug: 'kids-room', label: '儿童房', description: '成长与想象力的空间' },
  { slug: 'cloakroom', label: '衣帽间', description: '收纳即美学' },
  { slug: 'commercial', label: '商业空间', description: '店铺、展厅、办公等商业设计' },
];

export const styles: Category[] = [
  { slug: 'modern-minimalist', label: '现代极简', description: '少即是多，线面交织的纯粹表达' },
  { slug: 'japanese-wabisabi', label: '日式/侘寂', description: '不完美之美，静谧与自然共生' },
  { slug: 'nordic', label: '北欧', description: '温暖简约，功能与自然的平衡' },
  { slug: 'neo-chinese', label: '新中式', description: '东方意境，当代演绎' },
  { slug: 'light-luxury', label: '轻奢', description: '克制而精致的品质感' },
  { slug: 'industrial', label: '工业风', description: '粗犷与精致的碰撞' },
  { slug: 'cream-style', label: '奶油风', description: '柔和治愈的温馨氛围' },
  { slug: 'original-wood', label: '原木风', description: '以木为魂，自然肌理的温暖' },
  { slug: 'vintage', label: '复古', description: '时光沉淀的美学记忆' },
];
