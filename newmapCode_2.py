import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt

plt.rcParams['pdf.fonttype'] = 42
plt.rcParams['ps.fonttype'] = 42
plt.rcParams['font.family'] = 'Arial'

# Read the data
countries = gpd.read_file('map_data/countries.geojson')
bounds = gpd.read_file('map_data/country_bounds.geojson')
gdp_data = pd.read_excel('uploads/world_gdp.xlsx')

# Merge datasets
countries = countries.merge(gdp_data, on='NAME', how='left')

# Define the colormap
cmap = plt.get_cmap('Reds')
countries['color'] = countries['gdp_per_capita'].apply(
    lambda x: cmap(x / countries['gdp_per_capita'].max()) if pd.notnull(x) else '#eeeeee'
)

# Plot
fig, ax = plt.subplots(1, 1, figsize=(15, 10))
ax.set_axis_off()
countries = countries.to_crs('ESRI:54030')
bounds = bounds.to_crs('ESRI:54030')
countries.plot(ax=ax, color=countries['color'], edgecolor='white', linewidth=0.5)
bounds.plot(ax=ax, color='white', linewidth=0.5)

# Colorbar
sm = plt.cm.ScalarMappable(cmap=cmap, norm=plt.Normalize(vmin=countries['gdp_per_capita'].min(), 
                                                         vmax=countries['gdp_per_capita'].max()))
sm._A = []
cbar = fig.colorbar(sm, ax=ax)
cbar.set_label('GDP per Capita')

# Save
plt.savefig('map_output.png', bbox_inches='tight')
plt.savefig('map_output.pdf', bbox_inches='tight')