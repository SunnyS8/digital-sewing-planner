import { useCallback } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function useExportPDF() {
  const exportPDF = useCallback(async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${filename}.pdf`)
  }, [])

  return { exportPDF }
}

export function useExportImage() {
  const exportPNG = useCallback(async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  return { exportPNG }
}

export function useExportSVG() {
  const exportSVG = useCallback((elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const svgEl = element.querySelector('svg')
    if (!svgEl) return

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  return { exportSVG }
}
