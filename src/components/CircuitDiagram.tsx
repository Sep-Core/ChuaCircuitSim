export function CircuitDiagram() {
  return (
    <svg className="circuit-diagram" viewBox="0 0 620 220" role="img" aria-label="蔡氏电路原理图">
      <g className="circuit-wire">
        <path d="M48 76H155M155 76H268M370 76H484M484 76H572" />
        <path d="M48 182H572" />
        <path d="M94 76v30c-28 6-28 30 0 36v40" />
        <path d="M196 76v18c-22 8-22 20 0 28c22 8 22 20 0 28v32" />
        <path d="M268 76v38M268 138v44" />
        <path d="M484 76v38M484 138v44" />
        <path d="M554 76v22c-18 6-18 17 0 23c18 6 18 17 0 23v38" />
        <path d="M370 76v106" />
      </g>
      <g className="circuit-component">
        <path d="M250 114h36M250 126h36" />
        <path d="M466 114h36M466 126h36" />
        <path d="M318 76l7-13l14 26l14-26l14 26l14-13" />
        <rect x="351" y="108" width="38" height="48" rx="5" />
        <path d="M359 145l22-26M360 122h8v8M380 143h-8v-8" />
      </g>
      <g className="circuit-node">
        <circle cx="155" cy="76" r="4" />
        <circle cx="268" cy="76" r="4" />
        <circle cx="370" cy="76" r="4" />
        <circle cx="484" cy="76" r="4" />
      </g>
      <g className="circuit-label">
        <text x="79" y="63">L</text>
        <text x="177" y="63">C₁</text>
        <text x="246" y="104">VC₁</text>
        <text x="334" y="53">R</text>
        <text x="345" y="173">NR</text>
        <text x="466" y="104">VC₂</text>
        <text x="532" y="63">C₂</text>
        <text x="38" y="205">三阶自治动态网络</text>
        <text x="495" y="205">非线性负阻提供能量交换</text>
      </g>
    </svg>
  )
}
