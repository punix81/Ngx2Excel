/**
 * Clés de traduction structurées pour l'application
 * Ces clés correspondent aux fichiers de traduction en.json et fr.json
 */
export const translationKeys = {
  i18n: {
    app: {
      title: 'app.title',
      subtitle: 'app.subtitle'
    },
    routes: {
      admin: {
        translation: {
          convertExcel: 'routes.admin.translation.convertExcel',
          convertJson: 'routes.admin.translation.convertJson'
        }
      }
    },
    convertExcelToJson: {
      title: 'convertExcelToJson.title',
      description: 'convertExcelToJson.description',
      uploadButton: 'convertExcelToJson.uploadButton',
      convertButton: 'convertExcelToJson.convertButton',
      downloadButton: 'convertExcelToJson.downloadButton',
      maxFileSize: 'convertExcelToJson.maxFileSize',
      acceptedFormats: 'convertExcelToJson.acceptedFormats',
      selectedFiles: 'convertExcelToJson.selectedFiles',
      notifications: {
        uploadSuccess: 'convertExcelToJson.notifications.uploadSuccess',
        uploadError: 'convertExcelToJson.notifications.uploadError',
        convertSuccess: 'convertExcelToJson.notifications.convertSuccess',
        convertError: 'convertExcelToJson.notifications.convertError',
        noFilesSelected: 'convertExcelToJson.notifications.noFilesSelected'
      }
    },
    convertJsonToExcel: {
      title: 'convertJsonToExcel.title',
      description: 'convertJsonToExcel.description',
      formatInfo: 'convertJsonToExcel.formatInfo',
      chooseFiles: 'convertJsonToExcel.chooseFiles',
      selectedFiles: 'convertJsonToExcel.selectedFiles',
      outputFormat: 'convertJsonToExcel.outputFormat',
      excel: 'convertJsonToExcel.excel',
      csv: 'convertJsonToExcel.csv',
      convertButton: 'convertJsonToExcel.convertButton',
      resetButton: 'convertJsonToExcel.resetButton',
      processing: 'convertJsonToExcel.processing',
      notifications: {
        success: 'convertJsonToExcel.notifications.success',
        error: 'convertJsonToExcel.notifications.error',
        noFiles: 'convertJsonToExcel.notifications.noFiles'
      }
    },
    common: {
      language: 'common.language',
      english: 'common.english',
      french: 'common.french',
      close: 'common.close',
      cancel: 'common.cancel',
      save: 'common.save',
      delete: 'common.delete',
      edit: 'common.edit',
      confirm: 'common.confirm',
      back: 'common.back',
      next: 'common.next',
      loading: 'common.loading',
      error: 'common.error',
      success: 'common.success',
      warning: 'common.warning',
      info: 'common.info'
    }
  }
} as const;
