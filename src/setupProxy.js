const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

module.exports = function(app) {
  // Enable JSON body parsing
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  // API endpoint to save uploaded data directly to public folder
  app.post('/api/save-data', (req, res) => {
    try {
      const { data, productLine } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      // Determine filename based on product line
      const filename = productLine === 'shoulder'
        ? 'shoulder-data.json'
        : 'hip-knee-data.json';

      const filePath = path.join(__dirname, '..', 'public', 'data', filename);

      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      console.log(`✓ Saved ${filename} to public/data/`);

      res.json({
        success: true,
        message: `Data saved successfully to public/data/${filename}`,
        filename
      });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({
        error: 'Failed to save data',
        details: error.message
      });
    }
  });
};
