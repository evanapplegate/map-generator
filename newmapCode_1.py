import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd

# Read in the data
countries = gpd.read_file('map_data/countries.geojson')
bounds = gpd.read_file('map_data/country_bounds.geojson')
gdp_data = pd.read_excel('uploads/world_gdp.xlsx')

# Merge country data with GDP data
countries = countries.merge(gdp_data[['NAME', 'gdp_per_capita']], on='NAME', how='left')

# Projection
countries = countries.to_crs('ESRI:54030')
bounds = bounds.to_crs('ESRI:54030')

# Plotting
plt.rcParams['pdf.fonttype'] = 42
plt.rcParams['ps.fonttype'] = 42
plt.rcParams['font.family'] = 'Arial'

fig, ax = plt.subplots(1, 1, figsize=(15, 10))
bounds.plot(ax=ax, color='white', linewidth=0.5)
countries.plot(ax=ax, column='gdp_per_capita', cmap='Reds', edgecolor='white', linewidth=0,
               missing_kwds={"color": "#eeeeee", "edgecolor": "white"})

# Add legend
sm = plt.cm.ScalarMappable(cmap='Reds', norm=plt.Normalize(vmin=countries['gdp_per_capita'].min(), vmax=countries['gdp_per_capita'].max()))
sm._A = []
cbar = fig.colorbar(sm, ax=ax)
cbar.set_label('GDP per Capita')

# Save the output
plt.savefig('map_output.pdf', bbox_inches='tight')
plt.savefig('map_output.png', bbox_inches='tight')
plt.show()