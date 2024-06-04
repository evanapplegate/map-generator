document.addEventListener('DOMContentLoaded', function() {
    const placeholderTexts = {
        world: "Example: I attached world_gdp.xlsx, countries are in a column called 'NAME' and GDP per capita for each country is in a column called 'gdp_per_capita'. Color each country by gdp_per_capita per capita, dark red for high, light pink for low, gradations in between. If a country doesn't have a value for gdp_per_capita, color it #eeeeee. White borders with a 0.5px outline.",
        us: "Example: label states with their two-digit postal codes in black capital letters, AL MN NM are filled red, NY OR are fulled blue, the rest of the states are light grey. White borders with a 1px wide outline.",
        other: "Need Uruguay shown in context within South America, fill it with red, make the rest of the countries #FEFAF6. White borders with a 1px wide outline."
    };

    // When a map choice is clicked, set the selected map type and show the form.
    document.querySelectorAll('.map-choice').forEach(choice => {
        choice.addEventListener('click', function() {
            // Remove 'selected' class from all map choices
            document.querySelectorAll('.map-choice').forEach(c => c.classList.remove('selected'));

            // Add 'selected' class to clicked map choice
            this.classList.add('selected');

            const selectedMapType = this.dataset.mapType;
            document.getElementById('mapType').value = selectedMapType;
            document.getElementById('colorSelection').style.display = 'none';
            document.getElementById('mapForm').style.display = 'block';

            // Set the placeholder text based on the selected map type
            document.getElementById('map_request').placeholder = placeholderTexts[selectedMapType];
        });
    });

    // When a color button is clicked, set the selected color. 
    document.querySelectorAll('.color-button').forEach(button => {
        button.addEventListener('click', function() {
            const selectedColor = this.dataset.color;
            document.getElementById('selectedColor').value = selectedColor;
            // You might want to add some visual feedback to indicate the selected color
        });
    });
    // Show the loading message when the form is submitted.
    document.getElementById('mapForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData();
        
        // Retrieve the value of 'mapRequest' from the textarea with id 'map_request'
        const mapRequest = document.getElementById('map_request').value;
        
        // Retrieve the value of 'mapType' from the hidden input with id 'mapType'
        const mapType = document.getElementById('mapType').value;
      
        formData.append('mapType', mapType);
        formData.append('mapRequest', mapRequest);
        formData.append('file', document.getElementById('file').files[0]);
      
        try {
            const response = await fetch('/generate-map', {
                method: 'POST',
                body: formData,
              });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const result = await response.json();
          const d3Code = result.d3Code;
      
          // Log the generated D3.js code for debugging
          console.log('Generated D3.js code:', d3Code);
      
          // Execute the D3.js code to render the SVG
          const script = new Function('d3', d3Code);
          script(d3); // Assuming d3 is globally available

          document.getElementById('svgContainer').innerHTML = d3Code;
      
          document.getElementById('loadingMessage').style.display = 'none';
          document.getElementById('generatedMaps').style.display = 'block';
        } catch (error) {
          console.error('Failed to generate map:', error);
          document.getElementById('loadingMessage').style.display = 'none';
        }
      });
});