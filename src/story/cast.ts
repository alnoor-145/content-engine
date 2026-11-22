import type { Look } from "./Character";

// Ready-made original cast. Use any of these ids in StoryScene "characters" (copy the object),
// or change colours/outfits to make new ones. None of them copy an existing cartoon character.
export const CAST_LIBRARY: Look[] = [
  { id: "kalam", name: "কালাম চাচা", type: "man", skin: "#B9824F", hair: "#1E1E1E", shirt: "#F6F1E1", pants: "#2E8B57", color: "#7BD389", outfit: "lungi", hat: "straw", accessories: ["gamchha", "mustache"] },
  { id: "dr-ruma", name: "ডা. রুমা", type: "woman", skin: "#D9A066", hair: "#2B1B12", shirt: "#4DB6AC", pants: "#2B1B12", color: "#4DD4FF", outfit: "doctor", accessories: ["glasses", "stethoscope"] },
  { id: "sumon", name: "সুমন", type: "man", skin: "#C68642", hair: "#151515", shirt: "#3D5A80", pants: "#2A3A55", color: "#9DB4FF", outfit: "police" },
  { id: "rina", name: "রিনা আপা", type: "woman", skin: "#E0AC69", hair: "#1B1210", shirt: "#0FA3B1", pants: "#F2C14E", color: "#5CE1E6", outfit: "saree", accessories: ["glasses"] },
  { id: "tanim", name: "তানিম", type: "boy", skin: "#C68642", hair: "#1B1B1B", shirt: "#FFFFFF", pants: "#1E3A5F", color: "#FF6B6B", outfit: "school", accessories: ["backpack"] },
  { id: "ayesha", name: "আয়েশা", type: "girl", skin: "#D9A066", hair: "#2B1B12", shirt: "#9B5DE5", pants: "#F15BB5", color: "#F15BB5", outfit: "salwar", hat: "hijab" },
  { id: "hujur", name: "হুজুর", type: "elder", skin: "#B9824F", hair: "#E5E5E5", shirt: "#FAFAF5", pants: "#EDEDED", color: "#E9C46A", outfit: "panjabi", hat: "tupi", accessories: ["beard", "mustache"] },
  { id: "nani", name: "নানু", type: "grandma", skin: "#C9925E", hair: "#DADADA", shirt: "#FDFBF6", pants: "#C0392B", color: "#FF8FAB", outfit: "saree", accessories: ["glasses"] },
  { id: "babu", name: "বাবু শেফ", type: "man", skin: "#D9A066", hair: "#2A1A10", shirt: "#E63946", pants: "#3A3A3A", color: "#FFB703", outfit: "chef", accessories: ["mustache"] },
  { id: "arif", name: "আরিফ সাহেব", type: "man", skin: "#E0AC69", hair: "#20140C", shirt: "#264653", pants: "#1D2D35", color: "#E76F51", outfit: "suit" },
  { id: "mitu", name: "মিতু", type: "woman", skin: "#C68642", hair: "#1A1A1A", shirt: "#577590", pants: "#2F3E46", color: "#FF8A1F", outfit: "worker" },
  { id: "bolt", name: "বল্টু", type: "robot", skin: "#9AA5B1", hair: "#555", shirt: "#6C8EBF", pants: "#4A5A70", color: "#4DD4FF" },
  { id: "mini", name: "মিনি", type: "cat", skin: "#F4A261", hair: "#C46A2A", shirt: "#E63946", pants: "#000", color: "#F4A261" },
  { id: "bhola", name: "ভোলা", type: "dog", skin: "#D4A373", hair: "#7F5539", shirt: "#3A86FF", pants: "#000", color: "#D4A373" },
  { id: "lali", name: "লালি", type: "cow", skin: "#FFFFFF", hair: "#3D2B1F", shirt: "#E63946", pants: "#000", color: "#FFFFFF" },
  { id: "kukku", name: "কুক্কু", type: "chicken", skin: "#FFF4E0", hair: "#E07A2E", shirt: "#E63946", pants: "#000", color: "#FFB703" },
];
